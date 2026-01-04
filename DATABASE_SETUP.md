# GlobalPass 数据库配置指南

## 📋 概述

本指南说明如何将 GlobalPass 前端应用连接到 Supabase 数据库。

## 🔑 Supabase 连接信息

```
项目 URL: https://mzodnvjtlujvvwfnpcyb.supabase.co
项目 Reference ID: mzodnvjtlujvvwfnpcyb
数据库主机: db.mzodnvjtlujvvwfnpcyb.supabase.co
数据库端口: 5432
数据库名: postgres
用户: postgres
密码: qlalfdlek3652807
```

## 🛠️ 方案 A：使用 Python 脚本初始化数据库

### 前提条件
- Python 3.7+
- `psycopg2` 库已安装

### 步骤

1. **在本地运行初始化脚本**：
   ```bash
   cd /path/to/globalpass
   python3 scripts/init_db_supabase.py
   ```

2. **脚本将自动**：
   - 创建三张表：`esim_packages`、`supported_devices`、`users`
   - 启用 RLS (Row Level Security)
   - 创建允许公开读取的策略
   - 插入初始数据

3. **验证**：
   - 脚本会输出成功消息
   - 显示插入的数据条数

## 🛠️ 方案 B：在 Supabase 控制台手动执行 SQL

### 步骤

1. **打开 Supabase 控制台**：
   - 访问 https://app.supabase.com
   - 登录您的账户
   - 选择 GlobalPass 项目

2. **打开 SQL Editor**：
   - 左侧菜单 → SQL Editor
   - 点击 "New Query"

3. **复制并执行以下 SQL**：

```sql
-- 1. 创建 esim_packages 表
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

-- 2. 创建 supported_devices 表
CREATE TABLE IF NOT EXISTS public.supported_devices (
    id BIGSERIAL PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    is_supported BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 创建 users 表
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nationality VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 启用 RLS
ALTER TABLE public.esim_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supported_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 5. 创建 RLS 策略 - 允许所有用户读取
DROP POLICY IF EXISTS "Allow public read on esim_packages" ON public.esim_packages;
CREATE POLICY "Allow public read on esim_packages"
    ON public.esim_packages FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow public read on supported_devices" ON public.supported_devices;
CREATE POLICY "Allow public read on supported_devices"
    ON public.supported_devices FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow public read on users" ON public.users;
CREATE POLICY "Allow public read on users"
    ON public.users FOR SELECT
    USING (true);

-- 6. 插入 E-SIM 套餐数据
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
('Thailand', '10GB', 19.99, 'Airalo', 'https://airalo.com/thailand');

-- 7. 插入设备数据
INSERT INTO public.supported_devices (brand, model, is_supported) VALUES
('Apple', 'iPhone 14', true),
('Apple', 'iPhone 15', true),
('Apple', 'iPhone 15 Pro', true),
('Apple', 'iPhone 15 Pro Max', true),
('Samsung', 'Galaxy S23', true),
('Samsung', 'Galaxy S24', true),
('Google', 'Pixel 8', true),
('Google', 'Pixel 8 Pro', true);
```

4. **执行查询**：
   - 点击 "Run" 按钮
   - 等待执行完成

## 📱 获取 Supabase 匿名密钥

1. **打开 Supabase 控制台**
2. **进入项目设置**：
   - 左侧菜单 → Settings
   - 选择 "API"
3. **复制 Anon Public 密钥**：
   - 这是前端应用需要的公开密钥

## 🔗 修改前端配置以使用数据库

### 当前配置（本地数据）
前端目前使用本地配置文件 `client/src/data/esim-data.ts`

### 切换到数据库配置

1. **创建 Supabase 客户端文件**：
   ```typescript
   // client/src/lib/supabase.ts
   import { createClient } from '@supabase/supabase-js'

   const SUPABASE_URL = 'https://mzodnvjtlujvvwfnpcyb.supabase.co'
   const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'

   export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
   ```

2. **修改 ESIMPage.tsx 以从数据库读取**：
   ```typescript
   import { useEffect, useState } from 'react'
   import { supabase } from '@/lib/supabase'

   export default function ESIMPage() {
     const [esimPackages, setEsimPackages] = useState([])
     const [devices, setDevices] = useState([])

     useEffect(() => {
       // 获取 E-SIM 套餐
       supabase
         .from('esim_packages')
         .select('*')
         .then(({ data }) => setEsimPackages(data || []))

       // 获取设备
       supabase
         .from('supported_devices')
         .select('*')
         .then(({ data }) => setDevices(data || []))
     }, [])

     // 使用 esimPackages 和 devices 替代本地数据
   }
   ```

## ✅ 验证

### 检查表是否创建成功

在 Supabase 控制台：
1. 左侧菜单 → Table Editor
2. 应该看到三张表：
   - `esim_packages`
   - `supported_devices`
   - `users`

### 检查数据是否插入成功

在 Supabase 控制台：
1. 点击 `esim_packages` 表
2. 应该看到 9 条记录（3 个国家 × 3 个套餐）
3. 点击 `supported_devices` 表
4. 应该看到 8 条设备记录

### 检查 RLS 策略

在 Supabase 控制台：
1. 左侧菜单 → Authentication → Policies
2. 应该看到为每张表创建的策略

## 🔒 安全建议

1. **不要在前端代码中硬编码密码**
2. **使用环境变量存储 API 密钥**：
   ```bash
   VITE_SUPABASE_URL=https://mzodnvjtlujvvwfnpcyb.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. **RLS 策略已配置为允许公开读取**
   - 这对于公开的 E-SIM 比价信息是安全的
   - 如需写入权限，请添加更严格的策略

## 📞 故障排除

### 连接失败
- 检查网络连接
- 验证主机名和端口
- 确认密码正确

### 表已存在错误
- 这是正常的，脚本使用 `IF NOT EXISTS`
- 如需重新创建表，先删除旧表

### RLS 策略错误
- 确保在创建策略前启用了 RLS
- 检查策略语法

## 📚 相关文档

- [Supabase 文档](https://supabase.com/docs)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
