-- ==========================================
-- 0. CLEAN SLATE (強制重置結構)
-- ==========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_review_inserted ON public.reviews;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.reschedule_booking(uuid, timestamp with time zone);
DROP FUNCTION IF EXISTS public.reschedule_booking(uuid, timestamp with time zone, uuid, uuid);
DROP FUNCTION IF EXISTS public.update_beautician_stats();
DROP TABLE IF EXISTS public.beautician_services CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.time_slots CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.beauticians CASCADE;
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

-- Beauticians: 美容師資料
CREATE TABLE public.beauticians (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  avatar_url text,
  specialties text[], -- 專長 (例如：['面部護理', '精油按摩'])
  experience_years integer DEFAULT 0,
  bio text,
  rating numeric DEFAULT 5.0,
  review_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Services: 服務項目 (全域型錄)
CREATE TABLE public.services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  price numeric NOT NULL,
  duration integer NOT NULL, -- 單位：分鐘
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Beautician Services: 美容師與服務的多對多關聯
CREATE TABLE public.beautician_services (
  beautician_id uuid REFERENCES public.beauticians(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id) ON DELETE CASCADE,
  PRIMARY KEY (beautician_id, service_id)
);

-- Time Slots: 時段管理 (綁定美容師)
CREATE TABLE public.time_slots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  beautician_id uuid REFERENCES public.beauticians(id) ON DELETE CASCADE,
  slot_time timestamp with time zone NOT NULL,
  is_booked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(beautician_id, slot_time)
);

-- Bookings: 預約記錄
CREATE TABLE public.bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  beautician_id uuid REFERENCES public.beauticians(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  service_name text NOT NULL,
  scheduled_at timestamp with time zone NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 防重覆預約索引：同一美容師同一時間只能有一筆非取消的預約
CREATE UNIQUE INDEX idx_beautician_time_unique ON public.bookings (beautician_id, scheduled_at) 
WHERE (status != 'cancelled');

-- Reviews: 顧客評價
CREATE TABLE public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE,
  beautician_id uuid REFERENCES public.beauticians(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now()
);

-- ==========================================
-- 2. 啟用 RLS
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beauticians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beautician_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.bookings REPLICA IDENTITY FULL;

-- ==========================================
-- 3. 安全策略 (Policies)
-- ==========================================

-- Profiles 策略
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ( auth.uid() = id );
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ( auth.uid() = id );
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING ( true );

-- Beauticians 策略
CREATE POLICY "Allow public to view beauticians" ON public.beauticians FOR SELECT USING (true);
CREATE POLICY "Admins can manage beauticians" ON public.beauticians FOR ALL TO authenticated 
  USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') );

-- Services 策略
CREATE POLICY "Allow public to view active services" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage services" ON public.services FOR ALL TO authenticated 
  USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') );

-- Beautician Services 策略
CREATE POLICY "Allow public to view beautician services" ON public.beautician_services FOR SELECT USING (true);
CREATE POLICY "Admins can manage beautician services" ON public.beautician_services FOR ALL TO authenticated 
  USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') );

-- Reviews 策略
CREATE POLICY "Allow public to view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert review for own completed booking" ON public.reviews 
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = booking_id
      AND user_id = auth.uid()
      AND status = 'confirmed'
      AND scheduled_at < now()
    )
  );

-- Time Slots 策略
CREATE POLICY "Allow public to view time slots" ON public.time_slots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage time slots" ON public.time_slots FOR ALL TO authenticated 
  USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') );

-- Bookings 策略
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT TO authenticated USING ( auth.uid() = user_id );  
CREATE POLICY "Users can insert own bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK ( auth.uid() = user_id );
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE TO authenticated USING ( auth.uid() = user_id );
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
  p_new_time timestamp with time zone,
  p_new_beautician_id uuid DEFAULT NULL,
  p_new_service_id uuid DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_user_id uuid;
  v_old_beautician_id uuid;
  v_old_time timestamp with time zone;
  v_final_beautician_id uuid;
  v_final_service_id uuid;
BEGIN
  SELECT user_id, beautician_id, scheduled_at, service_id
  INTO v_user_id, v_old_beautician_id, v_old_time, v_final_service_id
  FROM public.bookings
  WHERE id = p_booking_id;

  IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
    RAISE EXCEPTION '無權限修改此預約或預約不存在';
  END IF;

  v_final_beautician_id := COALESCE(p_new_beautician_id, v_old_beautician_id);
  v_final_service_id := COALESCE(p_new_service_id, v_final_service_id);

  IF v_old_time < (now() + interval '24 hours') THEN
    RAISE EXCEPTION '預約時間前 24 小時內不可修改';
  END IF;

  -- 檢查新美容師在新時段是否可用
  IF NOT EXISTS (
    SELECT 1 FROM public.time_slots 
    WHERE beautician_id = v_final_beautician_id 
    AND slot_time = p_new_time 
    AND is_booked = false
  ) THEN
    RAISE EXCEPTION '該時段已被佔用或美容師不提供服務';
  END IF;

  -- 釋放舊時段
  UPDATE public.time_slots SET is_booked = false 
  WHERE beautician_id = v_old_beautician_id AND slot_time = v_old_time;
  
  -- 佔用新時段
  UPDATE public.time_slots SET is_booked = true 
  WHERE beautician_id = v_final_beautician_id AND slot_time = p_new_time;
  
  -- 更新預約記錄
  UPDATE public.bookings SET 
    scheduled_at = p_new_time,
    beautician_id = v_final_beautician_id,
    service_id = v_final_service_id
  WHERE id = p_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 原子化建立預約函數 (RPC)
CREATE OR REPLACE FUNCTION public.create_booking(
  p_service_id uuid,
  p_beautician_id uuid,
  p_customer_name text,
  p_service_name text,
  p_scheduled_at timestamp with time zone
)
RETURNS uuid AS $$
DECLARE
  v_booking_id uuid;
BEGIN
  -- 1. 檢查時段是否仍然可用且未被佔用 (悲觀鎖)
  IF NOT EXISTS (
    SELECT 1 FROM public.time_slots 
    WHERE beautician_id = p_beautician_id 
    AND slot_time = p_scheduled_at 
    AND is_booked = false
    FOR UPDATE
  ) THEN
    RAISE EXCEPTION '該時段已被佔用，請重新選擇';
  END IF;

  -- 2. 建立預約記錄 (觸發 UNIQUE 索引檢查)
  INSERT INTO public.bookings (
    user_id, service_id, beautician_id, customer_name, service_name, scheduled_at, status
  )
  VALUES (
    auth.uid(), p_service_id, p_beautician_id, p_customer_name, p_service_name, p_scheduled_at, 'pending'
  )
  RETURNING id INTO v_booking_id;

  -- 3. 標記時段為已佔用
  UPDATE public.time_slots 
  SET is_booked = true 
  WHERE beautician_id = p_beautician_id 
  AND slot_time = p_scheduled_at;

  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 自動更新美容師評分與總數
CREATE OR REPLACE FUNCTION public.update_beautician_stats()
RETURNS trigger AS $$
BEGIN
  UPDATE public.beauticians
  SET 
    rating = (SELECT COALESCE(AVG(rating), 5.0)::numeric(2,1) FROM public.reviews WHERE beautician_id = NEW.beautician_id),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE beautician_id = NEW.beautician_id)
  WHERE id = NEW.beautician_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_inserted
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE PROCEDURE public.update_beautician_stats();

-- ==========================================
-- 5. 範例資料 (Seed Data)
-- ==========================================

INSERT INTO public.beauticians (full_name, avatar_url, specialties, experience_years, bio, rating)
VALUES 
('陳美美', 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=200', ARRAY['深層潔膚', '水光管理'], 8, '專精於韓式皮膚管理，致力於讓每位顧客擁有發亮的肌膚。', 4.9),
('林小雅', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200', ARRAY['精油按摩', '經絡放鬆'], 5, '擅長利用植物精油緩解現代人的壓力和肌肉緊繃。', 4.8);

INSERT INTO public.services (name, description, price, duration)
VALUES 
('深層潔膚護理', '深入毛孔，清除污垢與黑頭，讓肌膚重現光澤。', 1200, 60),
('韓式水光管理', '深度補水亮白，改善毛孔粗大與細紋問題。', 2500, 100),
('全背精油放鬆', '透過植物精油與專業手法，緩解肩頸壓力。', 2200, 60),
('熱石經絡按摩', '結合溫熱礦石，促進體體循環，深度緩解疲勞。', 2800, 90);

DO $$
DECLARE
  v_mimi_id uuid;
  v_yaya_id uuid;
  v_service_id uuid;
BEGIN
  SELECT id INTO v_mimi_id FROM public.beauticians WHERE full_name = '陳美美';
  SELECT id INTO v_yaya_id FROM public.beauticians WHERE full_name = '林小雅';

  -- 陳美美提供的服務
  SELECT id INTO v_service_id FROM public.services WHERE name = '深層潔膚護理';
  INSERT INTO public.beautician_services (beautician_id, service_id) VALUES (v_mimi_id, v_service_id);
  SELECT id INTO v_service_id FROM public.services WHERE name = '韓式水光管理';
  INSERT INTO public.beautician_services (beautician_id, service_id) VALUES (v_mimi_id, v_service_id);
  
  -- 林小雅提供的服務
  SELECT id INTO v_service_id FROM public.services WHERE name = '全背精油放鬆';
  INSERT INTO public.beautician_services (beautician_id, service_id) VALUES (v_yaya_id, v_service_id);
  SELECT id INTO v_service_id FROM public.services WHERE name = '熱石經絡按摩';
  INSERT INTO public.beautician_services (beautician_id, service_id) VALUES (v_yaya_id, v_service_id);

  -- 測試多對多：假設陳美美也能做全背精油
  SELECT id INTO v_service_id FROM public.services WHERE name = '全背精油放鬆';
  INSERT INTO public.beautician_services (beautician_id, service_id) VALUES (v_mimi_id, v_service_id);
END $$;

-- 為每位美容師建立時段
DO $$
DECLARE
  v_beautician record;
  v_date date;
  v_hour int;
BEGIN
  FOR v_beautician IN SELECT id FROM public.beauticians LOOP
    FOR i IN 1..7 LOOP
      v_date := current_date + i;
      FOR v_hour IN 10..18 LOOP
        INSERT INTO public.time_slots (beautician_id, slot_time)
        VALUES (v_beautician.id, (v_date + (v_hour || ' hours')::interval)::timestamp with time zone)
        ON CONFLICT DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
