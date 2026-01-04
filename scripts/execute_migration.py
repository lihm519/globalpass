#!/usr/bin/env python3
"""
GlobalPass v1.1 - 执行数据库迁移脚本
使用 Service Role Key 通过 Supabase REST API 执行 SQL 迁移
"""

import requests
import json
from datetime import datetime

# Supabase 配置
SUPABASE_URL = "https://mzodnvjtlujvvwfnpcyb.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16b2Rudmp0bHVqdnZ3Zm5wY3liIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0MDk4NiwiZXhwIjoyMDgzMTE2OTg2fQ.gr-5J22EhV08PLghNcoS8o5lUFjaEyby21MwE-35ENs"

# 迁移 SQL 语句
MIGRATION_SQL = """
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
"""

def execute_migration():
    """
    通过 Supabase REST API 执行迁移 SQL
    """
    print("=" * 70)
    print("🚀 GlobalPass v1.1 - 数据库迁移执行")
    print("=" * 70)
    
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }
    
    # Supabase SQL 执行端点
    url = f"{SUPABASE_URL}/rest/v1/rpc/execute_sql"
    
    # 分割 SQL 语句为单个命令
    sql_commands = [cmd.strip() for cmd in MIGRATION_SQL.split(';') if cmd.strip()]
    
    print(f"\n📋 准备执行 {len(sql_commands)} 个 SQL 命令...")
    
    success_count = 0
    error_count = 0
    
    for i, sql_cmd in enumerate(sql_commands, 1):
        try:
            print(f"\n[{i}/{len(sql_commands)}] 执行: {sql_cmd[:60]}...")
            
            # 尝试通过 REST API 执行
            payload = {"query": sql_cmd}
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            
            if response.status_code in [200, 201]:
                print(f"✅ 成功")
                success_count += 1
            else:
                print(f"❌ 失败: {response.status_code}")
                print(f"   响应: {response.text[:200]}")
                error_count += 1
                
        except Exception as e:
            print(f"❌ 错误: {str(e)[:100]}")
            error_count += 1
    
    print("\n" + "=" * 70)
    print(f"📊 迁移结果: {success_count} 成功, {error_count} 失败")
    print("=" * 70)
    
    return error_count == 0

def execute_via_sql_editor():
    """
    备选方案：通过 Supabase SQL Editor 端点执行
    """
    print("\n🔄 尝试备选方案：使用 SQL Editor 端点...")
    
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }
    
    # 尝试执行完整的迁移 SQL
    url = f"{SUPABASE_URL}/rest/v1/sql"
    
    try:
        payload = {"sql": MIGRATION_SQL}
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text[:500]}")
        
        if response.status_code in [200, 201]:
            print("✅ 迁移成功!")
            return True
        else:
            print("❌ 迁移失败")
            return False
            
    except Exception as e:
        print(f"❌ 错误: {e}")
        return False

def main():
    try:
        # 首先尝试主方案
        success = execute_migration()
        
        if not success:
            print("\n⚠️  主方案失败，尝试备选方案...")
            success = execute_via_sql_editor()
        
        if success:
            print("\n✨ 数据库迁移完成！")
            print("💡 提示：刷新前端页面以查看地区选择功能")
            return 0
        else:
            print("\n❌ 数据库迁移失败")
            print("💡 建议：请在 Supabase 控制台手动执行 scripts/migration_v1.1.sql")
            return 1
            
    except Exception as e:
        print(f"\n❌ 发生错误: {e}")
        return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())
