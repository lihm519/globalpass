-- 添加多币种价格字段到 esim_packages 表
ALTER TABLE esim_packages 
ADD COLUMN IF NOT EXISTS price_usd DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS price_eur DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS price_sgd DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS price_cny DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS price_jpy DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS price_gbp DECIMAL(10,2);

-- 将现有的 price 字段数据迁移到 price_usd
UPDATE esim_packages SET price_usd = price WHERE price_usd IS NULL;

-- 添加注释
COMMENT ON COLUMN esim_packages.price_usd IS 'Price in US Dollars';
COMMENT ON COLUMN esim_packages.price_eur IS 'Price in Euros';
COMMENT ON COLUMN esim_packages.price_sgd IS 'Price in Singapore Dollars';
COMMENT ON COLUMN esim_packages.price_cny IS 'Price in Chinese Yuan';
COMMENT ON COLUMN esim_packages.price_jpy IS 'Price in Japanese Yen';
COMMENT ON COLUMN esim_packages.price_gbp IS 'Price in British Pounds';
