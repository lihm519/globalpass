-- GlobalPass 数据库初始化脚本
-- 在 Supabase 控制台的 SQL Editor 中执行此脚本

-- ===== 1. 创建表 =====

-- 创建 esim_packages 表
CREATE TABLE IF NOT EXISTS public.esim_packages (
    id BIGSERIAL PRIMARY KEY,
    country VARCHAR(100) NOT NULL,
    data_amount VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    affiliate_link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建 supported_devices 表
CREATE TABLE IF NOT EXISTS public.supported_devices (
    id BIGSERIAL PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    is_supported BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建 users 表
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nationality VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== 2. 启用 RLS (Row Level Security) =====

ALTER TABLE public.esim_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supported_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ===== 3. 创建 RLS 策略 =====

-- esim_packages: 允许所有用户读取
DROP POLICY IF EXISTS "Allow public read on esim_packages" ON public.esim_packages;
CREATE POLICY "Allow public read on esim_packages"
    ON public.esim_packages FOR SELECT
    USING (true);

-- supported_devices: 允许所有用户读取
DROP POLICY IF EXISTS "Allow public read on supported_devices" ON public.supported_devices;
CREATE POLICY "Allow public read on supported_devices"
    ON public.supported_devices FOR SELECT
    USING (true);

-- users: 允许所有用户读取
DROP POLICY IF EXISTS "Allow public read on users" ON public.users;
CREATE POLICY "Allow public read on users"
    ON public.users FOR SELECT
    USING (true);

-- ===== 4. 插入初始数据 =====

-- 清空现有数据（可选）
-- DELETE FROM public.esim_packages;
-- DELETE FROM public.supported_devices;

-- 插入 E-SIM 套餐数据
INSERT INTO public.esim_packages (country, data_amount, price, provider, affiliate_link) VALUES
-- 日本
('Japan', '1GB', 4.99, 'Airalo', 'https://airalo.com/japan'),
('Japan', '3GB', 9.99, 'Airalo', 'https://airalo.com/japan'),
('Japan', '10GB', 24.99, 'Airalo', 'https://airalo.com/japan'),
-- 美国
('USA', '1GB', 5.99, 'Airalo', 'https://airalo.com/usa'),
('USA', '3GB', 12.99, 'Airalo', 'https://airalo.com/usa'),
('USA', '10GB', 29.99, 'Airalo', 'https://airalo.com/usa'),
-- 泰国
('Thailand', '1GB', 3.99, 'Airalo', 'https://airalo.com/thailand'),
('Thailand', '3GB', 8.99, 'Airalo', 'https://airalo.com/thailand'),
('Thailand', '10GB', 19.99, 'Airalo', 'https://airalo.com/thailand')
ON CONFLICT DO NOTHING;

-- 插入设备数据
INSERT INTO public.supported_devices (brand, model, is_supported) VALUES
('Apple', 'iPhone 14', true),
('Apple', 'iPhone 15', true),
('Apple', 'iPhone 15 Pro', true),
('Apple', 'iPhone 15 Pro Max', true),
('Samsung', 'Galaxy S23', true),
('Samsung', 'Galaxy S24', true),
('Google', 'Pixel 8', true),
('Google', 'Pixel 8 Pro', true)
ON CONFLICT DO NOTHING;

-- ===== 5. 验证 =====

-- 查看 E-SIM 套餐数据
SELECT COUNT(*) as esim_package_count FROM public.esim_packages;
SELECT * FROM public.esim_packages LIMIT 5;

-- 查看设备数据
SELECT COUNT(*) as device_count FROM public.supported_devices;
SELECT * FROM public.supported_devices LIMIT 5;

-- ===== 完成 =====
-- 如果以上查询都返回了数据，说明数据库初始化成功！
