#!/usr/bin/env python3
"""
导入 Airalo 数据到数据库
"""

import sys
import json
sys.path.insert(0, '/home/ubuntu/globalpass/scripts')

from airalo_final import scrape_airalo_country
import pymysql
from datetime import datetime
import os
from urllib.parse import urlparse

# 解析数据库 URL
DB_URL = os.getenv('DATABASE_URL', '')
if not DB_URL:
    print("错误: DATABASE_URL 环境变量未设置")
    sys.exit(1)

# 解析 mysql://user:password@host:port/database?ssl
url = urlparse(DB_URL)
db_config = {
    'host': url.hostname,
    'port': url.port or 3306,
    'user': url.username,
    'password': url.password,
    'database': url.path.lstrip('/').split('?')[0],
    'ssl': {'ssl': True} if 'ssl' in url.query else None,
}

# 测试国家列表（前 10 个热门国家）
countries = [
    ("Japan", "japan"),
    ("USA", "united-states"),
    ("Thailand", "thailand"),
    ("South Korea", "south-korea"),
    ("Singapore", "singapore"),
    ("UK", "united-kingdom"),
    ("France", "france"),
    ("Germany", "germany"),
    ("Italy", "italy"),
    ("Spain", "spain"),
]

def import_packages():
    """导入套餐数据到数据库"""
    
    # 连接数据库
    conn = pymysql.connect(**db_config)
    cur = conn.cursor()
    
    # 清空现有数据
    print("清空现有 Airalo 数据...")
    cur.execute("DELETE FROM esim_packages WHERE provider = 'Airalo'")
    conn.commit()
    
    total_packages = 0
    
    for country_name, airalo_slug in countries:
        packages = scrape_airalo_country(country_name, airalo_slug)
        
        print(f"\n{country_name}: {len(packages)} 个套餐")
        
        # 插入数据库
        for pkg in packages:
            cur.execute("""
                INSERT INTO esim_packages (
                    provider, country, planName, dataType, dataAmount,
                    validity, price, network, link, rawData, lastChecked
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                pkg['provider'],
                pkg['country'],
                pkg['plan_name'],
                pkg['data_type'],
                pkg['data_amount'],
                pkg['validity'],
                pkg['price'],
                pkg['network'],
                pkg['link'],
                pkg['raw_data'],
                pkg['last_checked']
            ))
        
        conn.commit()
        total_packages += len(packages)
    
    cur.close()
    conn.close()
    
    print(f"\n✅ 成功导入 {total_packages} 个套餐到数据库")

if __name__ == "__main__":
    import_packages()
