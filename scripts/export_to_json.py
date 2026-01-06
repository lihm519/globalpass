#!/usr/bin/env python3
"""
从数据库导出数据到 JSON 文件供前端使用
"""

import json
import pymysql
import os
from urllib.parse import urlparse
from datetime import datetime
from collections import defaultdict

# 解析数据库 URL
DB_URL = os.getenv('DATABASE_URL', '')
if not DB_URL:
    print("错误: DATABASE_URL 环境变量未设置")
    exit(1)

url = urlparse(DB_URL)
db_config = {
    'host': url.hostname,
    'port': url.port or 3306,
    'user': url.username,
    'password': url.password,
    'database': url.path.lstrip('/').split('?')[0],
    'ssl': {'ssl': True} if 'ssl' in url.query else None,
}

# 输出目录
OUTPUT_DIR = "/home/ubuntu/globalpass/client/public/data"

def export_to_json():
    """从数据库导出数据到 JSON"""
    
    print("=" * 70)
    print("开始导出数据...")
    print("=" * 70)
    
    # 连接数据库
    conn = pymysql.connect(**db_config)
    cur = conn.cursor(pymysql.cursors.DictCursor)
    
    # 查询所有套餐
    cur.execute("""
        SELECT 
            id, provider, country, planName, dataType, dataAmount,
            validity, price, network, link, rawData, lastChecked
        FROM esim_packages
        ORDER BY country, price
    """)
    
    rows = cur.fetchall()
    
    # 按国家分组
    packages_by_country = defaultdict(list)
    all_packages = []
    countries = set()
    
    for row in rows:
        # 转换字段名（数据库是 camelCase，前端期望 snake_case）
        package = {
            "id": row['id'],
            "provider": row['provider'],
            "country": row['country'],
            "plan_name": row['planName'],
            "data_type": row['dataType'],
            "data_amount": row['dataAmount'],
            "validity": row['validity'],
            "price": float(row['price']),
            "network": row['network'],
            "link": row['link'],
            "last_checked": row['lastChecked'].isoformat() if row['lastChecked'] else None,
            "raw_data": row['rawData']
        }
        
        packages_by_country[row['country']].append(package)
        all_packages.append(package)
        countries.add(row['country'])
    
    cur.close()
    conn.close()
    
    # 创建输出目录
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # 导出套餐数据
    packages_data = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "total_packages": len(all_packages),
        "countries": sorted(list(countries)),
        "packages": dict(packages_by_country),
        "all_packages": all_packages
    }
    
    packages_file = os.path.join(OUTPUT_DIR, "esim-packages.json")
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
    
    countries_file = os.path.join(OUTPUT_DIR, "countries.json")
    with open(countries_file, 'w', encoding='utf-8') as f:
        json.dump(countries_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 导出国家列表: {countries_file}")
    
    print("=" * 70)
    print("导出完成！")
    print("=" * 70)

if __name__ == "__main__":
    export_to_json()
