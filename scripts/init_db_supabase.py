#!/usr/bin/env python3
"""
GlobalPass 数据库初始化脚本
使用 Supabase 标准连接方式
"""

import psycopg2
from psycopg2 import sql
import sys

# Supabase PostgreSQL 连接配置 - 使用标准连接地址
# 格式: postgres://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres
DB_HOST = "db.mzodnvjtlujvvwfnpcyb.supabase.co"
DB_PORT = 5432
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASSWORD = "qlalfdlek3652807"
PROJECT_REF = "mzodnvjtlujvvwfnpcyb"

def init_database():
    """初始化数据库表和 RLS 策略"""
    
    print("🔧 开始初始化 Supabase 数据库...")
    print(f"📍 连接到: {DB_HOST}:{DB_PORT}")
    print(f"👤 用户: {DB_USER}")
    
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
        print("✅ 数据库连接成功！")
        
    except Exception as e:
        print(f"❌ 数据库连接失败: {str(e)}")
        print("\n💡 错误详情:")
        print(f"   - 主机: {DB_HOST}")
        print(f"   - 端口: {DB_PORT}")
        print(f"   - 用户: {DB_USER}")
        print(f"   - 数据库: {DB_NAME}")
        sys.exit(1)
    
    # SQL 脚本：创建表和 RLS 策略
    sql_commands = [
        # 1. 创建 esim_packages 表
        """
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
        """,
        
        # 2. 创建 supported_devices 表
        """
        CREATE TABLE IF NOT EXISTS public.supported_devices (
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
        CREATE TABLE IF NOT EXISTS public.users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) UNIQUE NOT NULL,
            nationality VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        
        # 4. 启用 RLS - esim_packages
        """
        ALTER TABLE public.esim_packages ENABLE ROW LEVEL SECURITY;
        """,
        
        # 5. 创建 RLS 策略 - esim_packages (允许所有人读取)
        """
        DROP POLICY IF EXISTS "Allow public read on esim_packages" ON public.esim_packages;
        CREATE POLICY "Allow public read on esim_packages"
            ON public.esim_packages FOR SELECT
            USING (true);
        """,
        
        # 6. 启用 RLS - supported_devices
        """
        ALTER TABLE public.supported_devices ENABLE ROW LEVEL SECURITY;
        """,
        
        # 7. 创建 RLS 策略 - supported_devices (允许所有人读取)
        """
        DROP POLICY IF EXISTS "Allow public read on supported_devices" ON public.supported_devices;
        CREATE POLICY "Allow public read on supported_devices"
            ON public.supported_devices FOR SELECT
            USING (true);
        """,
        
        # 8. 启用 RLS - users
        """
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        """,
        
        # 9. 创建 RLS 策略 - users (允许所有人读取)
        """
        DROP POLICY IF EXISTS "Allow public read on users" ON public.users;
        CREATE POLICY "Allow public read on users"
            ON public.users FOR SELECT
            USING (true);
        """,
    ]
    
    # 执行 SQL 命令
    print("\n📋 执行 SQL 命令...")
    success_count = 0
    
    for i, sql_cmd in enumerate(sql_commands, 1):
        try:
            cursor.execute(sql_cmd)
            conn.commit()
            print(f"✅ 命令 {i} 执行成功")
            success_count += 1
        except Exception as e:
            conn.rollback()
            error_msg = str(e)
            if "already exists" in error_msg.lower():
                print(f"⚠️  命令 {i}: 对象已存在（跳过）")
                success_count += 1
            else:
                print(f"❌ 命令 {i} 执行失败: {error_msg}")
    
    # 插入初始数据
    print("\n📦 插入初始数据...")
    
    # E-SIM 套餐数据
    esim_data = [
        # 日本
        ("Japan", "1GB", 4.99, "Airalo", "https://airalo.com/japan"),
        ("Japan", "3GB", 9.99, "Airalo", "https://airalo.com/japan"),
        ("Japan", "10GB", 24.99, "Airalo", "https://airalo.com/japan"),
        # 美国
        ("USA", "1GB", 5.99, "Airalo", "https://airalo.com/usa"),
        ("USA", "3GB", 12.99, "Airalo", "https://airalo.com/usa"),
        ("USA", "10GB", 29.99, "Airalo", "https://airalo.com/usa"),
        # 泰国
        ("Thailand", "1GB", 3.99, "Airalo", "https://airalo.com/thailand"),
        ("Thailand", "3GB", 8.99, "Airalo", "https://airalo.com/thailand"),
        ("Thailand", "10GB", 19.99, "Airalo", "https://airalo.com/thailand"),
    ]
    
    try:
        # 先清空现有数据
        cursor.execute("DELETE FROM public.esim_packages;")
        conn.commit()
        
        for country, data_amount, price, provider, link in esim_data:
            cursor.execute(
                """
                INSERT INTO public.esim_packages (country, data_amount, price, provider, affiliate_link)
                VALUES (%s, %s, %s, %s, %s);
                """,
                (country, data_amount, price, provider, link)
            )
        conn.commit()
        print(f"✅ 插入 {len(esim_data)} 条 E-SIM 套餐数据")
    except Exception as e:
        conn.rollback()
        print(f"⚠️  插入 E-SIM 数据出错: {str(e)}")
    
    # 设备数据
    device_data = [
        ("Apple", "iPhone 14", True),
        ("Apple", "iPhone 15", True),
        ("Apple", "iPhone 15 Pro", True),
        ("Apple", "iPhone 15 Pro Max", True),
        ("Samsung", "Galaxy S23", True),
        ("Samsung", "Galaxy S24", True),
        ("Google", "Pixel 8", True),
        ("Google", "Pixel 8 Pro", True),
    ]
    
    try:
        # 先清空现有数据
        cursor.execute("DELETE FROM public.supported_devices;")
        conn.commit()
        
        for brand, model, is_supported in device_data:
            cursor.execute(
                """
                INSERT INTO public.supported_devices (brand, model, is_supported)
                VALUES (%s, %s, %s);
                """,
                (brand, model, is_supported)
            )
        conn.commit()
        print(f"✅ 插入 {len(device_data)} 条设备数据")
    except Exception as e:
        conn.rollback()
        print(f"⚠️  插入设备数据出错: {str(e)}")
    
    # 验证数据
    print("\n✔️  验证数据...")
    try:
        cursor.execute("SELECT COUNT(*) FROM public.esim_packages;")
        pkg_count = cursor.fetchone()[0]
        print(f"✅ E-SIM 套餐: {pkg_count} 条记录")
        
        cursor.execute("SELECT COUNT(*) FROM public.supported_devices;")
        device_count = cursor.fetchone()[0]
        print(f"✅ 设备: {device_count} 条记录")
        
        # 显示样本数据
        cursor.execute("SELECT country, data_amount, price FROM public.esim_packages LIMIT 3;")
        print("\n📋 E-SIM 套餐样本：")
        for row in cursor.fetchall():
            print(f"   - {row[0]}: {row[1]} @ ${row[2]}")
        
        cursor.execute("SELECT brand, model FROM public.supported_devices LIMIT 3;")
        print("\n📱 设备样本：")
        for row in cursor.fetchall():
            print(f"   - {row[0]} {row[1]}")
        
    except Exception as e:
        print(f"⚠️  数据验证出错: {str(e)}")
    
    cursor.close()
    conn.close()
    
    print("\n" + "="*60)
    print("✅ 数据库初始化完成！")
    print("="*60)
    print("\n📊 完成统计：")
    print(f"   - SQL 命令: {success_count}/{len(sql_commands)} 成功")
    print(f"   - E-SIM 套餐: {len(esim_data)} 条")
    print(f"   - 设备: {len(device_data)} 条")
    print("\n🔐 RLS 策略已配置：允许所有用户读取数据")
    print("\n📝 连接字符串:")
    print(f"   postgres://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}")

if __name__ == "__main__":
    init_database()
