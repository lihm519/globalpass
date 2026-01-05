"""
更新 Airalo Japan 套餐数据到数据库
使用从浏览器工具抓取的准确数据
"""
import requests
import json
from datetime import datetime

# Supabase 配置
SUPABASE_URL = "https://mzodnvjtlujvvwfnpcyb.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16b2Rudmp0bHVqdnZ3Zm5wY3liIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0MDk4NiwiZXhwIjoyMDgzMTE2OTg2fQ.gr-5J22EhV08PLghNcoS8o5lUFjaEyby21MwE-35ENs"

# Airalo Japan 套餐数据（从浏览器工具抓取）
packages = [
    {"data": "1", "validity": "3", "price": 4.00},
    {"data": "3", "validity": "3", "price": 7.50},
    {"data": "3", "validity": "7", "price": 8.00},
    {"data": "5", "validity": "7", "price": 10.00},
    {"data": "10", "validity": "7", "price": 17.00},
    {"data": "5", "validity": "15", "price": 10.50},
    {"data": "10", "validity": "15", "price": 17.50},
    {"data": "20", "validity": "15", "price": 24.00},
    {"data": "5", "validity": "30", "price": 11.00},
    {"data": "10", "validity": "30", "price": 18.00},
    {"data": "20", "validity": "30", "price": 25.00},
]

def delete_old_airalo_japan():
    """删除旧的 Airalo Japan 数据"""
    url = f"{SUPABASE_URL}/rest/v1/esim_packages?provider=eq.Airalo&country=eq.Japan"
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    }
    
    response = requests.delete(url, headers=headers)
    print(f"删除旧数据: HTTP {response.status_code}")

def insert_package(package_data):
    """插入新套餐"""
    data_amount = package_data["data"]
    validity = package_data["validity"]
    price = package_data["price"]
    
    package = {
        "provider": "Airalo",
        "country": "Japan",
        "plan_name": f"Japan {data_amount}GB {validity} Days",
        "data_type": "Data",
        "data_amount": f"{data_amount}GB",
        "validity": f"{validity} Days",
        "price": price,
        "network": "Local Operators",
        "link": "https://www.airalo.com/japan-esim",
        "raw_data": json.dumps({
            "original_price": price,
            "currency": "USD",
            "data": f"{data_amount}GB",
            "validity": f"{validity} Days",
        }),
        "last_checked": datetime.utcnow().isoformat(),
    }
    
    url = f"{SUPABASE_URL}/rest/v1/esim_packages"
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }
    
    response = requests.post(url, headers=headers, json=package)
    
    if response.status_code in [200, 201]:
        print(f"✅ 插入成功: {package['plan_name']} - ${price}")
        return True
    else:
        print(f"❌ 插入失败: {package['plan_name']} - HTTP {response.status_code}")
        print(f"   响应: {response.text[:200]}")
        return False

if __name__ == "__main__":
    print("="*60)
    print("🚀 更新 Airalo Japan 套餐数据")
    print("="*60)
    
    # 步骤 1: 删除旧数据
    print("\n步骤 1: 删除旧的 Airalo Japan 数据...")
    delete_old_airalo_japan()
    
    # 步骤 2: 插入新数据
    print("\n步骤 2: 插入新的套餐数据...")
    success_count = 0
    for pkg in packages:
        if insert_package(pkg):
            success_count += 1
    
    print("\n="*60)
    print(f"✅ 完成！成功插入 {success_count}/{len(packages)} 个套餐")
    print("="*60)
