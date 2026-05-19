-- ==========================================
-- 0. CLEAN SLATE (強制重置結構)
-- ==========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.reschedule_booking(uuid, timestamp with time zone);
DROP TABLE IF EXISTS public.time_slots CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ==========================================
-- 1. 建立資料表 (Tables)
-- ==========================================

-- Profiles: 用戶資料與權限
CREATE TABLE public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  role text DEFAULT 'customer' CHECK (role IN ('customer', 'beautician', 'admin')),
  updated_at timestamp with time zone DEFAULT now()
);

-- Services: 服務項目
CREATE TABLE public.services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  duration integer NOT NULL, -- 單位：分鐘
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Time Slots: 時段管理
CREATE TABLE public.time_slots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id uuid REFERENCES public.services(id) ON DELETE CASCADE,
  slot_time timestamp with time zone NOT NULL,
  is_booked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(service_id, slot_time)
);

-- Bookings: 預約記錄
CREATE TABLE public.bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL, -- 關聯服務 ID
  customer_name text NOT NULL,
  service_name text NOT NULL,
  scheduled_at timestamp with time zone NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- ==========================================
-- 2. 啟用 RLS 與 設定 Identity
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.bookings REPLICA IDENTITY FULL;

-- ==========================================
-- 3. 安全策略 (Policies)
-- ==========================================

-- Profiles 策略
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ( auth.uid() = id );
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ( auth.uid() = id );
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING ( true );

-- Services 策略
DROP POLICY IF EXISTS "Allow public to view active services" ON public.services;
CREATE POLICY "Allow public to view active services" ON public.services FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
CREATE POLICY "Admins can manage services" ON public.services FOR ALL TO authenticated 
  USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') );

-- Time Slots 策略
DROP POLICY IF EXISTS "Allow public to view time slots" ON public.time_slots;
CREATE POLICY "Allow public to view time slots" ON public.time_slots FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can manage time slots" ON public.time_slots;
CREATE POLICY "Admins can manage time slots" ON public.time_slots FOR ALL TO authenticated 
  USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') );

-- Bookings 策略
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT TO authenticated USING ( auth.uid() = user_id );  
DROP POLICY IF EXISTS "Users can insert own bookings" ON public.bookings;
CREATE POLICY "Users can insert own bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK ( auth.uid() = user_id );
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE TO authenticated USING ( auth.uid() = user_id );
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
CREATE POLICY "Admins can manage all bookings" ON public.bookings FOR ALL TO authenticated 
  USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') );

-- ==========================================
-- 4. 自動化功能 (Functions & Triggers)
-- ==========================================

-- 當用戶註冊時自動建立 Profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    'customer'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 原子化改期函數 (RPC)
CREATE OR REPLACE FUNCTION public.reschedule_booking(
  p_booking_id uuid,
  p_new_time timestamp with time zone
)
RETURNS void AS $$
DECLARE
  v_user_id uuid;
  v_service_id uuid;
  v_old_time timestamp with time zone;
BEGIN
  -- 1. 取得預約資訊並檢查擁有權
  SELECT user_id, service_id, scheduled_at 
  INTO v_user_id, v_service_id, v_old_time
  FROM public.bookings
  WHERE id = p_booking_id;

  IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
    RAISE EXCEPTION '無權限修改此預約或預約不存在';
  END IF;

  -- 2. 檢查 24 小時限制 (考慮時區，使用 now())
  IF v_old_time < (now() + interval '24 hours') THEN
    RAISE EXCEPTION '預約時間前 24 小時內不可修改';
  END IF;

  -- 3. 檢查新時段是否可用
  IF NOT EXISTS (
    SELECT 1 FROM public.time_slots 
    WHERE service_id = v_service_id 
    AND slot_time = p_new_time 
    AND is_booked = false
  ) THEN
    RAISE EXCEPTION '該時段已被佔用或不提供服務';
  END IF;

  -- 4. 執行原子更新
  -- 釋放舊時段
  UPDATE public.time_slots SET is_booked = false 
  WHERE service_id = v_service_id AND slot_time = v_old_time;
  
  -- 佔用新時段
  UPDATE public.time_slots SET is_booked = true 
  WHERE service_id = v_service_id AND slot_time = p_new_time;
  
  -- 更新預約記錄
  UPDATE public.bookings SET scheduled_at = p_new_time 
  WHERE id = p_booking_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 5. 範例資料 (Seed Data)
-- ==========================================
-- 預填服務項目
INSERT INTO public.services (name, description, price, duration)
VALUES 
('深層潔膚護理', '深入毛孔，清除污垢與黑頭，讓肌膚重現光澤。', 1200, 60),
('保濕修護療程', '高效補水精華，改善乾燥脫皮，提升肌膚含水量。', 1500, 90),
('美白亮膚管理', '抑制黑色素生成，淡化色斑，均均膚色。', 1800, 75),
('全背精油放鬆', '透過植物精油與專業手法，緩解肩頸壓力。', 2200, 60),
('韓式水光管理', '深度補水亮白，改善毛孔粗大與細紋問題。', 2500, 100);

-- 為所有服務項目產生未來一週的時段 (示範用)
DO $$
DECLARE
  v_service record;
  v_date date;
  v_hour int;
BEGIN
  FOR v_service IN SELECT id FROM public.services LOOP
    FOR i IN 1..7 LOOP
      v_date := current_date + i;
      FOR v_hour IN 10..18 LOOP -- 10:00 到 18:00
        INSERT INTO public.time_slots (service_id, slot_time)
        VALUES (v_service.id, (v_date + (v_hour || ' hours')::interval)::timestamp with time zone)
        ON CONFLICT DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
