#!/usr/bin/env python3
"""
Supabase 数据库初始化脚本
创建表结构并配置 RLS 策略
"""

import psycopg2
from psycopg2 import sql

# Supabase PostgreSQL 连接配置
DB_HOST = "mzodnvjtlujvvwfnpcyb.supabase.co"
DB_PORT = 5432
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASSWORD = "sb_secret_EXlA9hedOTaxj0-RpG4wdw_KN1JDBfc"

def init_database():
    """初始化数据库表和 RLS 策略"""
    
    print("🔧 开始初始化 Supabase 数据库...")
    
    try:
        # 连接到 PostgreSQL
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            sslmode='require'
        )
        cursor = conn.cursor()
        
        # SQL 脚本：创建表和 RLS 策略
        sql_commands = [
            # 1. 创建 esim_packages 表
            """
            CREATE TABLE IF NOT EXISTS esim_packages (
                id BIGSERIAL PRIMARY KEY,
                country VARCHAR(100) NOT NULL,
                data_amount VARCHAR(50) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                provider VARCHAR(100) NOT NULL,
                affiliate_link TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """,
            
            # 2. 创建 supported_devices 表
            """
            CREATE TABLE IF NOT EXISTS supported_devices (
                id BIGSERIAL PRIMARY KEY,
                brand VARCHAR(100) NOT NULL,
                model VARCHAR(100) NOT NULL,
                is_supported BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """,
            
            # 3. 创建 users 表
            """
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                nationality VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """,
            
            # 4. 启用 RLS - esim_packages
            """
            ALTER TABLE esim_packages ENABLE ROW LEVEL SECURITY;
            """,
            
            # 5. 创建 RLS 策略 - esim_packages
            """
            DROP POLICY IF EXISTS "Allow public read access on esim_packages" ON esim_packages;
            CREATE POLICY "Allow public read access on esim_packages"
                ON esim_packages FOR SELECT
                USING (true);
            """,
            
            # 6. 启用 RLS - supported_devices
            """
            ALTER TABLE supported_devices ENABLE ROW LEVEL SECURITY;
            """,
            
            # 7. 创建 RLS 策略 - supported_devices
            """
            DROP POLICY IF EXISTS "Allow public read access on supported_devices" ON supported_devices;
            CREATE POLICY "Allow public read access on supported_devices"
                ON supported_devices FOR SELECT
                USING (true);
            """,
            
            # 8. 启用 RLS - users
            """
            ALTER TABLE users ENABLE ROW LEVEL SECURITY;
            """,
            
            # 9. 创建 RLS 策略 - users
            """
            DROP POLICY IF EXISTS "Allow public read access on users" ON users;
            CREATE POLICY "Allow public read access on users"
                ON users FOR SELECT
                USING (true);
            """,
        ]
        
        # 执行 SQL 命令
        for i, sql_cmd in enumerate(sql_commands, 1):
            try:
                cursor.execute(sql_cmd)
                conn.commit()
                print(f"✅ 命令 {i} 执行成功")
            except Exception as e:
                conn.rollback()
                print(f"⚠️  命令 {i} 执行失败: {str(e)}")
        
        cursor.close()
        conn.close()
        
        print("\n✅ 数据库初始化完成！")
        print("📋 已创建表：")
        print("   - esim_packages (E-SIM 套餐)")
        print("   - supported_devices (支持的设备)")
        print("   - users (用户信息)")
        print("\n🔐 已启用 RLS 并配置公开读取策略")
        
    except Exception as e:
        print(f"❌ 数据库连接失败: {str(e)}")
        raise

if __name__ == "__main__":
    init_database()
