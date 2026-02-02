/**
 * GlobalPass - 最终商业标准数据库架构
 * 阶段一：数据库终极封板
 * 
 * 表结构：
 * 1. esim_packages - E-SIM 套餐主表（新架构）
 * 2. supported_devices - 支持的设备列表（保持 v1.2）
 */

-- ============================================================================
-- 清理旧表
-- ============================================================================
DROP TABLE IF EXISTS esim_packages CASCADE;
DROP TABLE IF EXISTS supported_devices CASCADE;

-- ============================================================================
-- 创建 esim_packages 表 (最终商业标准)
-- ============================================================================
CREATE TABLE esim_packages (
  id BIGSERIAL PRIMARY KEY,
  provider TEXT NOT NULL,                    -- 供应商: Airalo/Nomad/Holafly
  country TEXT NOT NULL,                     -- 国家英文名: Japan, USA, Thailand
  plan_name TEXT NOT NULL,                   -- 套餐名: "Japan 1GB 7 Days"
  data_type TEXT NOT NULL,                   -- 'Fixed' 或 'Unlimited'
  data_amount TEXT NOT NULL,                 -- '1GB', '3GB', 'Unlimited'
  validity TEXT NOT NULL,                    -- '7 Days', '30 Days'
  price NUMERIC(10, 2) NOT NULL,             -- 仅存 USD 数字
  network TEXT,                              -- 运营商信息: "SoftBank", "Verizon"
  link TEXT NOT NULL,                        -- 购买链接
  raw_data JSONB,                            -- 原始抓取数据备份
  last_checked TIMESTAMP DEFAULT NOW(),      -- 最后更新时间
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_esim_packages_country ON esim_packages(country);
CREATE INDEX idx_esim_packages_provider ON esim_packages(provider);
CREATE INDEX idx_esim_packages_data_type ON esim_packages(data_type);
CREATE INDEX idx_esim_packages_price ON esim_packages(price);

-- ============================================================================
-- 创建 supported_devices 表 (v1.2 - 保持不变)
-- ============================================================================
CREATE TABLE supported_devices (
  id BIGSERIAL PRIMARY KEY,
  brand TEXT NOT NULL,                       -- 品牌: Apple, Samsung
  model TEXT NOT NULL,                       -- 型号: iPhone 14, Galaxy S23
  is_supported BOOLEAN NOT NULL DEFAULT true,
  region TEXT NOT NULL DEFAULT 'Global',     -- 'Global' 或 'China/HK/Macau'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_supported_devices_brand_model ON supported_devices(brand, model);
CREATE INDEX idx_supported_devices_region ON supported_devices(region);

-- ============================================================================
-- 启用 RLS (Row Level Security)
-- ============================================================================
ALTER TABLE esim_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE supported_devices ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 创建 RLS 策略 - 允许所有用户读取数据
-- ============================================================================

-- esim_packages 读权限策略
CREATE POLICY "Allow public read esim_packages"
  ON esim_packages
  FOR SELECT
  USING (true);

-- esim_packages 写权限策略（仅服务角色）
CREATE POLICY "Allow service role write esim_packages"
  ON esim_packages
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role update esim_packages"
  ON esim_packages
  FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- supported_devices 读权限策略
CREATE POLICY "Allow public read supported_devices"
  ON supported_devices
  FOR SELECT
  USING (true);

-- supported_devices 写权限策略（仅服务角色）
CREATE POLICY "Allow service role write supported_devices"
  ON supported_devices
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role update supported_devices"
  ON supported_devices
  FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- 插入初始设备数据 (v1.2)
-- ============================================================================

-- iPhone 设备
INSERT INTO supported_devices (brand, model, is_supported, region) VALUES
  ('Apple', 'iPhone 15', true, 'Global'),
  ('Apple', 'iPhone 15', false, 'China/HK/Macau'),
  ('Apple', 'iPhone 15 Pro', true, 'Global'),
  ('Apple', 'iPhone 15 Pro', false, 'China/HK/Macau'),
  ('Apple', 'iPhone 15 Pro Max', true, 'Global'),
  ('Apple', 'iPhone 15 Pro Max', false, 'China/HK/Macau'),
  ('Apple', 'iPhone 14', true, 'Global'),
  ('Apple', 'iPhone 14', false, 'China/HK/Macau'),
  ('Apple', 'iPhone 14 Pro', true, 'Global'),
  ('Apple', 'iPhone 14 Pro', false, 'China/HK/Macau'),
  ('Apple', 'iPhone 14 Pro Max', true, 'Global'),
  ('Apple', 'iPhone 14 Pro Max', false, 'China/HK/Macau'),
  ('Apple', 'iPhone 13', true, 'Global'),
  ('Apple', 'iPhone 13', false, 'China/HK/Macau'),
  ('Apple', 'iPhone 13 Pro', true, 'Global'),
  ('Apple', 'iPhone 13 Pro', false, 'China/HK/Macau');

-- Samsung 设备
INSERT INTO supported_devices (brand, model, is_supported, region) VALUES
  ('Samsung', 'Galaxy S24', true, 'Global'),
  ('Samsung', 'Galaxy S24', true, 'China/HK/Macau'),
  ('Samsung', 'Galaxy S24 Ultra', true, 'Global'),
  ('Samsung', 'Galaxy S24 Ultra', true, 'China/HK/Macau'),
  ('Samsung', 'Galaxy S23', true, 'Global'),
  ('Samsung', 'Galaxy S23', true, 'China/HK/Macau'),
  ('Samsung', 'Galaxy S23 Ultra', true, 'Global'),
  ('Samsung', 'Galaxy S23 Ultra', true, 'China/HK/Macau');

-- Google Pixel 设备
INSERT INTO supported_devices (brand, model, is_supported, region) VALUES
  ('Google', 'Pixel 8', true, 'Global'),
  ('Google', 'Pixel 8', true, 'China/HK/Macau'),
  ('Google', 'Pixel 8 Pro', true, 'Global'),
  ('Google', 'Pixel 8 Pro', true, 'China/HK/Macau'),
  ('Google', 'Pixel 7', true, 'Global'),
  ('Google', 'Pixel 7', true, 'China/HK/Macau');

-- ============================================================================
-- 验证表结构
-- ============================================================================
-- 运行以下命令验证：
-- SELECT * FROM esim_packages LIMIT 1;
-- SELECT * FROM supported_devices LIMIT 1;
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';
