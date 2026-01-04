#!/usr/bin/env python3
"""
E-SIM 数据填充脚本
从 Airalo 抓取数据或使用模拟数据填充 Supabase
"""

from supabase import create_client, Client
import requests
import json
from typing import List, Dict

# Supabase 连接配置
SUPABASE_URL = "https://mzodnvjtlujvvwfnpcyb.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16b2RudmR0bHVqdnZ3Zm5wY3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3MDI4OTAsImV4cCI6MjA0ODI3ODg5MH0.2bJZfPJTpCxMdcqNLlVHvRWHFvdEFQ3lZGCm8vwqxEA"

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

def fetch_airalo_data():
    """
    尝试从 Airalo 官网抓取数据
    如果失败，返回 None
    """
    try:
        print("🌐 尝试从 Airalo 抓取数据...")
        # 这是一个示例 URL，实际的 Airalo API 可能需要认证
        response = requests.get("https://www.airalo.com/api/v1/packages", timeout=10)
        if response.status_code == 200:
            print("✅ 成功从 Airalo 获取数据")
            return response.json()
    except Exception as e:
        print(f"⚠️  从 Airalo 抓取失败: {str(e)}")
    
    return None

def populate_esim_packages(supabase: Client):
    """填充 E-SIM 套餐数据"""
    print("\n📦 开始填充 E-SIM 套餐数据...")
    
    try:
        # 先清空现有数据
        supabase.table("esim_packages").delete().neq("id", 0).execute()
        print("✅ 清空旧数据")
    except:
        print("⚠️  清空旧数据失败（可能是第一次运行）")
    
    # 插入模拟数据
    try:
        for package in MOCK_ESIM_PACKAGES:
            supabase.table("esim_packages").insert(package).execute()
        print(f"✅ 成功插入 {len(MOCK_ESIM_PACKAGES)} 条 E-SIM 套餐数据")
    except Exception as e:
        print(f"❌ 插入 E-SIM 数据失败: {str(e)}")
        return False
    
    return True

def populate_devices(supabase: Client):
    """填充设备支持数据"""
    print("\n📱 开始填充设备支持数据...")
    
    try:
        # 先清空现有数据
        supabase.table("supported_devices").delete().neq("id", 0).execute()
        print("✅ 清空旧数据")
    except:
        print("⚠️  清空旧数据失败（可能是第一次运行）")
    
    # 插入模拟数据
    try:
        for device in MOCK_DEVICES:
            supabase.table("supported_devices").insert(device).execute()
        print(f"✅ 成功插入 {len(MOCK_DEVICES)} 条设备数据")
    except Exception as e:
        print(f"❌ 插入设备数据失败: {str(e)}")
        return False
    
    return True

def verify_data(supabase: Client):
    """验证数据是否成功插入"""
    print("\n✔️  验证数据...")
    
    try:
        # 验证 E-SIM 套餐数据
        packages = supabase.table("esim_packages").select("*").execute()
        print(f"✅ E-SIM 套餐数据: {len(packages.data)} 条记录")
        
        # 验证设备数据
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
                print(f"   - {device['brand']} {device['model']}: {'✅ 支持' if device['is_supported'] else '❌ 不支持'}")
        
        return True
    except Exception as e:
        print(f"❌ 数据验证失败: {str(e)}")
        return False

def main():
    """主函数"""
    print("🚀 GlobalPass E-SIM 数据填充脚本")
    print("=" * 50)
    
    # 创建 Supabase 客户端
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        print("✅ Supabase 连接成功")
    except Exception as e:
        print(f"❌ Supabase 连接失败: {str(e)}")
        return
    
    # 尝试从 Airalo 抓取数据（可选）
    airalo_data = fetch_airalo_data()
    
    # 填充数据
    success = True
    success = populate_esim_packages(supabase) and success
    success = populate_devices(supabase) and success
    
    # 验证数据
    if success:
        verify_data(supabase)
        print("\n✅ 数据填充完成！")
    else:
        print("\n❌ 数据填充过程中出现错误")

if __name__ == "__main__":
    main()
