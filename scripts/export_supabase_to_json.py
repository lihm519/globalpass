#!/usr/bin/env python3
"""
从 Supabase 导出数据到 JSON 文件供前端使用
"""

import json
import requests
import os
from datetime import datetime
from pathlib import Path
from collections import defaultdict

# Supabase 配置（优先使用环境变量）
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://mzodnvjtlujvvwfnpcyb.supabase.co")
SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16b2Rudmp0bHVqdnZ3Zm5wY3liIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0MDk4NiwiZXhwIjoyMDgzMTE2OTg2fQ.gr-5J22EhV08PLghNcoS8o5lUFjaEyby21MwE-35ENs")

# 输出目录
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "data"

def export_to_json():
    """从 Supabase 导出数据到 JSON"""
    
    print("=" * 70)
    print("开始从 Supabase 导出数据...")
    print("=" * 70)
    
    # 设置请求头
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }
    
    # 查询所有套餐
    url = f"{SUPABASE_URL}/rest/v1/esim_packages?select=*&order=country,price"
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        print(f"❌ 查询失败: {response.status_code}")
        print(response.text)
        return
    
    rows = response.json()
    
    # 按国家分组
    packages_by_country = defaultdict(list)
    all_packages = []
    countries = set()
    
    for row in rows:
        # 转换字段名
        package = {
            "id": row['id'],
            "provider": row['provider'],
            "country": row['country'],
            "plan_name": row['plan_name'],
            "data_type": row['data_type'],
            "data_amount": row['data_amount'],
            "validity": row['validity'],
            "price": float(row['price']),
            "network": row.get('network', ''),
            "link": row['link'],
            "last_checked": row.get('last_checked'),
            "raw_data": row.get('raw_data')
        }
        
        packages_by_country[row['country']].append(package)
        all_packages.append(package)
        countries.add(row['country'])
    
    # 创建输出目录
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # 导出套餐数据
    packages_data = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "total_packages": len(all_packages),
        "countries": sorted(list(countries)),
        "packages": dict(packages_by_country),
        "all_packages": all_packages
    }
    
    packages_file = OUTPUT_DIR / "esim-packages.json"
    with open(packages_file, 'w', encoding='utf-8') as f:
        json.dump(packages_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 导出套餐数据: {packages_file}")
    print(f"   总套餐数: {len(all_packages)}")
    print(f"   国家数: {len(countries)}")
    
    # 导出国家列表
    countries_data = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "countries": sorted(list(countries)),
        "count": len(countries)
    }
    
    countries_file = OUTPUT_DIR / "countries.json"
    with open(countries_file, 'w', encoding='utf-8') as f:
        json.dump(countries_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 导出国家列表: {countries_file}")
    
    print("=" * 70)
    print("导出完成！")
    print("=" * 70)

if __name__ == "__main__":
    export_to_json()
