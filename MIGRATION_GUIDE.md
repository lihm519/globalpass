# GlobalPass v1.1 - 数据库迁移指南

## 概述
本指南说明如何在 Supabase 控制台中执行 v1.1 数据库迁移，以启用地区差异化的设备兼容性检测功能。

## 迁移内容
- ✅ 添加 `region` 字段到 `supported_devices` 表
- ✅ 插入地区差异化的设备数据（全球版 vs 国行/港澳版）
- ✅ 更新所有 Affiliate 链接为 Airalo 官网

## 执行步骤

### 1. 打开 Supabase 控制台
- 访问 [https://app.supabase.com](https://app.supabase.com)
- 登录您的账户
- 选择 GlobalPass 项目

### 2. 进入 SQL Editor
- 在左侧菜单中找到 **SQL Editor**
- 点击 **New Query** 创建新查询

### 3. 复制迁移脚本
复制下面的 SQL 代码到 SQL Editor：

```sql
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
```

### 4. 执行迁移
- 点击 **Run** 按钮（或按 `Ctrl+Enter`）
- 等待执行完成
- 应该看到类似的结果：
  ```
  device_count: 20
  package_count: 8
  ```

### 5. 验证迁移成功
执行以下查询验证数据：

```sql
-- 查看 iPhone 14 的所有版本
SELECT brand, model, is_supported, region FROM supported_devices 
WHERE brand = 'Apple' AND model = 'iPhone 14' 
ORDER BY region;

-- 查看所有套餐的 Affiliate 链接
SELECT country, data_amount, price, affiliate_link FROM esim_packages 
LIMIT 5;
```

### 6. 刷新前端
- 刷新 GlobalPass 应用页面
- 选择 iPhone 14 后，应该看到"选择版本"下拉框
- 选择不同版本会显示不同的兼容性状态

## 故障排除

### 问题 1：列已存在错误
如果看到 `column "region" of relation "supported_devices" already exists`：
- 说明 region 字段已经存在
- 跳过第一步，直接执行删除和插入操作

### 问题 2：外键约束错误
如果看到外键相关错误：
- 确保 `supported_devices` 表没有被其他表引用
- 或临时禁用外键检查

### 问题 3：权限不足
如果看到权限错误：
- 确保使用的是 Service Role Key 或具有足够权限的账户
- 检查 RLS 策略是否允许该操作

## 后续步骤

迁移完成后，您可以：

1. **运行数据抓取脚本** - 执行 `scripts/scrape_airalo_prices.py` 更新真实价格
2. **测试地区选择功能** - 在前端选择不同的设备版本
3. **扩展国家列表** - 在 `esim_packages` 表中添加更多国家

## 相关文件
- 迁移脚本：`scripts/migration_v1.1.sql`
- 数据抓取脚本：`scripts/scrape_airalo_prices.py`
- 前端代码：`client/src/pages/ESIMPage.tsx`
- Supabase 配置：`client/src/lib/supabase.ts`
