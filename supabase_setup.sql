-- ==========================================
-- 0. CLEAN SLATE (強制重置結構)
-- ==========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
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

-- Bookings: 預約記錄
CREATE TABLE public.bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
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
-- 移除遞迴的 Admin 策略，改用更簡單的方式（或是暫時允許驗證用戶查看 Profile 基礎資訊，實務上建議使用 Function）
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated 
  USING ( true ); -- 為了展示先開放讀取，實務上應限制

-- Services 策略
DROP POLICY IF EXISTS "Allow public to view active services" ON public.services;
CREATE POLICY "Allow public to view active services" ON public.services FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
CREATE POLICY "Admins can manage services" ON public.services FOR ALL TO authenticated 
  USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') );

-- Bookings 策略
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT TO authenticated USING ( auth.uid() = user_id );
DROP POLICY IF EXISTS "Users can insert own bookings" ON public.bookings;
CREATE POLICY "Users can insert own bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK ( auth.uid() = user_id );
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
CREATE POLICY "Admins can manage all bookings" ON public.bookings FOR ALL TO authenticated 
  USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') );

-- ==========================================
-- 4. 自動化功能 (Triggers)
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    'customer'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 5. 範例資料 (Seed Data)
-- ==========================================
INSERT INTO public.services (name, description, price, duration)
VALUES 
('深層潔膚護理', '深入毛孔，清除污垢與黑頭，讓肌膚重現光澤。', 1200, 60),
('保濕修護療程', '高效補水精華，改善乾燥脫皮，提升肌膚含水量。', 1500, 90),
('美白亮膚管理', '抑制黑色素生成，淡化色斑，均均膚色。', 1800, 75),
('全背精油放鬆', '透過植物精油與專業手法，緩解肩頸壓力。', 2200, 60),
('韓式水光管理', '深度補水亮白，改善毛孔粗大與細紋問題。', 2500, 100);
