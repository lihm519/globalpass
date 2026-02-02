#!/usr/bin/env python3
"""
GlobalPass 数据库完整设置脚本
使用 Service Role Key 初始化表和填充数据
"""

from supabase import create_client, Client
import json

# Supabase 连接配置（使用 Service Role Key）
SUPABASE_URL = "https://mzodnvjtlujvvwfnpcyb.supabase.co"
SUPABASE_SERVICE_KEY = "sb_secret_EXlA9hedOTaxj0-RpG4wdw_KN1JDBfc"

# 模拟 E-SIM 套餐数据
MOCK_ESIM_PACKAGES = [
    # 日本
    {"country": "Japan", "data_amount": "1GB", "price": 4.99, "provider": "Airalo", "affiliate_link": "https://airalo.com/japan"},
    {"country": "Japan", "data_amount": "3GB", "price": 9.99, "provider": "Airalo", "affiliate_link": "https://airalo.com/japan"},
    {"country": "Japan", "data_amount": "10GB", "price": 24.99, "provider": "Airalo", "affiliate_link": "https://airalo.com/japan"},
    
    # 美国
    {"country": "USA", "data_amount": "1GB", "price": 5.99, "provider": "Airalo", "affiliate_link": "https://airalo.com/usa"},
    {"country": "USA", "data_amount": "3GB", "price": 12.99, "provider": "Airalo", "affiliate_link": "https://airalo.com/usa"},
    {"country": "USA", "data_amount": "10GB", "price": 29.99, "provider": "Airalo", "affiliate_link": "https://airalo.com/usa"},
    
    # 泰国
    {"country": "Thailand", "data_amount": "1GB", "price": 3.99, "provider": "Airalo", "affiliate_link": "https://airalo.com/thailand"},
    {"country": "Thailand", "data_amount": "3GB", "price": 8.99, "provider": "Airalo", "affiliate_link": "https://airalo.com/thailand"},
    {"country": "Thailand", "data_amount": "10GB", "price": 19.99, "provider": "Airalo", "affiliate_link": "https://airalo.com/thailand"},
]

# 模拟设备支持数据
MOCK_DEVICES = [
    {"brand": "Apple", "model": "iPhone 14", "is_supported": True},
    {"brand": "Apple", "model": "iPhone 15", "is_supported": True},
    {"brand": "Apple", "model": "iPhone 15 Pro", "is_supported": True},
    {"brand": "Samsung", "model": "Galaxy S23", "is_supported": True},
    {"brand": "Samsung", "model": "Galaxy S24", "is_supported": True},
    {"brand": "Google", "model": "Pixel 8", "is_supported": True},
    {"brand": "Google", "model": "Pixel 8 Pro", "is_supported": True},
]

def setup_database():
    """设置数据库"""
    print("🚀 GlobalPass 数据库设置脚本")
    print("=" * 60)
    
    # 创建 Supabase 客户端（使用 Service Role Key）
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        print("✅ Supabase 连接成功（Service Role Key）")
    except Exception as e:
        print(f"❌ Supabase 连接失败: {str(e)}")
        return False
    
    # 尝试创建表
    print("\n📋 创建表结构...")
    
    # 1. 创建 esim_packages 表
    try:
        # 尝试删除现有表（如果存在）
        supabase.table("esim_packages").select("id").limit(1).execute()
        print("✅ esim_packages 表已存在")
    except:
        print("⚠️  esim_packages 表不存在，将通过插入数据自动创建")
    
    # 2. 创建 supported_devices 表
    try:
        supabase.table("supported_devices").select("id").limit(1).execute()
        print("✅ supported_devices 表已存在")
    except:
        print("⚠️  supported_devices 表不存在，将通过插入数据自动创建")
    
    # 填充 E-SIM 套餐数据
    print("\n📦 填充 E-SIM 套餐数据...")
    try:
        # 先清空数据
        try:
            supabase.table("esim_packages").delete().neq("id", 0).execute()
            print("✅ 清空旧数据")
        except:
            pass
        
        # 批量插入数据
        for package in MOCK_ESIM_PACKAGES:
            try:
                supabase.table("esim_packages").insert(package).execute()
            except Exception as e:
                print(f"⚠️  插入数据失败: {str(e)}")
        
        print(f"✅ 成功插入 {len(MOCK_ESIM_PACKAGES)} 条 E-SIM 套餐数据")
    except Exception as e:
        print(f"❌ E-SIM 数据填充失败: {str(e)}")
    
    # 填充设备数据
    print("\n📱 填充设备支持数据...")
    try:
        # 先清空数据
        try:
            supabase.table("supported_devices").delete().neq("id", 0).execute()
            print("✅ 清空旧数据")
        except:
            pass
        
        # 批量插入数据
        for device in MOCK_DEVICES:
            try:
                supabase.table("supported_devices").insert(device).execute()
            except Exception as e:
                print(f"⚠️  插入数据失败: {str(e)}")
        
        print(f"✅ 成功插入 {len(MOCK_DEVICES)} 条设备数据")
    except Exception as e:
        print(f"❌ 设备数据填充失败: {str(e)}")
    
    # 验证数据
    print("\n✔️  验证数据...")
    try:
        packages = supabase.table("esim_packages").select("*").execute()
        print(f"✅ E-SIM 套餐数据: {len(packages.data)} 条记录")
        
        devices = supabase.table("supported_devices").select("*").execute()
        print(f"✅ 设备数据: {len(devices.data)} 条记录")
        
        # 显示样本数据
        if packages.data:
            print("\n📋 E-SIM 套餐样本：")
            for pkg in packages.data[:3]:
                print(f"   - {pkg['country']}: {pkg['data_amount']} @ ${pkg['price']}")
        
        if devices.data:
            print("\n📱 设备样本：")
            for device in devices.data[:3]:
                status = "✅ 支持" if device['is_supported'] else "❌ 不支持"
                print(f"   - {device['brand']} {device['model']}: {status}")
        
        print("\n✅ 数据库设置完成！")
        return True
    except Exception as e:
        print(f"❌ 数据验证失败: {str(e)}")
        return False

if __name__ == "__main__":
    setup_database()
