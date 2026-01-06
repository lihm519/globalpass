-- GlobalPass v1.1 数据库迁移脚本
-- 目标：升级设备检测逻辑，支持地区差异化

-- 1. 修改 supported_devices 表，添加 region 字段
ALTER TABLE supported_devices 
ADD COLUMN region TEXT DEFAULT 'Global';

-- 2. 为现有数据添加默认地区标记
UPDATE supported_devices SET region = 'Global' WHERE region IS NULL;

-- 3. 清空现有数据，重新插入带地区信息的设备数据
DELETE FROM supported_devices;

-- 4. 插入 iPhone 设备数据（支持全球版和中国版差异）
INSERT INTO supported_devices (brand, model, is_supported, region) VALUES
-- iPhone 13 系列
('Apple', 'iPhone 13', true, 'Global'),
('Apple', 'iPhone 13', false, 'China/HK/Macau'),

-- iPhone 14 系列
('Apple', 'iPhone 14', true, 'Global'),
('Apple', 'iPhone 14', false, 'China/HK/Macau'),
('Apple', 'iPhone 14 Pro', true, 'Global'),
('Apple', 'iPhone 14 Pro', false, 'China/HK/Macau'),
('Apple', 'iPhone 14 Pro Max', true, 'Global'),
('Apple', 'iPhone 14 Pro Max', false, 'China/HK/Macau'),

-- iPhone 15 系列
('Apple', 'iPhone 15', true, 'Global'),
('Apple', 'iPhone 15', false, 'China/HK/Macau'),
('Apple', 'iPhone 15 Pro', true, 'Global'),
('Apple', 'iPhone 15 Pro', false, 'China/HK/Macau'),
('Apple', 'iPhone 15 Pro Max', true, 'Global'),
('Apple', 'iPhone 15 Pro Max', false, 'China/HK/Macau'),

-- iPhone X 系列（早期支持）
('Apple', 'iPhone X', true, 'Global'),
('Apple', 'iPhone X', false, 'China/HK/Macau'),

-- Samsung 设备（全球支持）
('Samsung', 'Galaxy S23', true, 'Global'),
('Samsung', 'Galaxy S24', true, 'Global'),

-- Google Pixel 设备（全球支持）
('Google', 'Pixel 8', true, 'Global'),
('Google', 'Pixel 8 Pro', true, 'Global');

-- 5. 更新所有 affiliate_link 为 Airalo 官网
UPDATE esim_packages SET affiliate_link = 'https://www.airalo.com' WHERE affiliate_link IS NOT NULL;

-- 6. 验证数据
SELECT COUNT(*) as device_count FROM supported_devices;
SELECT COUNT(*) as package_count FROM esim_packages;
