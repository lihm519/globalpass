#!/usr/bin/env python3
"""
测试修复后的 Airalo 爬虫
"""

import sys
sys.path.insert(0, '/home/ubuntu/globalpass/scripts')

from airalo_final import scrape_airalo_country

# 测试国家列表
test_countries = [
    ("Japan", "japan"),
    ("USA", "united-states"),
    ("Thailand", "thailand"),
]

print("=" * 70)
print("测试修复后的 Airalo 爬虫")
print("=" * 70)

total_packages = 0

for country_name, airalo_slug in test_countries:
    packages = scrape_airalo_country(country_name, airalo_slug)
    
    print(f"\n{country_name}: {len(packages)} 个套餐")
    print("-" * 70)
    
    for pkg in packages[:5]:  # 只显示前 5 个
        print(f"  - {pkg['plan_name']}: ${pkg['price']}")
    
    if len(packages) > 5:
        print(f"  ... 还有 {len(packages) - 5} 个套餐")
    
    total_packages += len(packages)

print("\n" + "=" * 70)
print(f"总计: {total_packages} 个套餐")
print("=" * 70)
