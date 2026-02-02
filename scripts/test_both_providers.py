#!/usr/bin/env python3
"""
测试 Airalo + Nomad 爬虫
"""

import sys
sys.path.insert(0, '/home/ubuntu/globalpass/scripts')

from airalo_final import scrape_airalo_country
from nomad_scraper import scrape_nomad_country

# 测试 Japan
print("=" * 70)
print("测试 Airalo + Nomad 爬虫")
print("=" * 70)

airalo_packages = scrape_airalo_country("Japan", "japan")
nomad_packages = scrape_nomad_country("Japan", "japan")

print(f"\n✅ Airalo: {len(airalo_packages)} 个套餐")
print(f"✅ Nomad: {len(nomad_packages)} 个套餐")
print(f"✅ 总计: {len(airalo_packages) + len(nomad_packages)} 个套餐")

print("\n" + "=" * 70)
print("Airalo 套餐示例:")
print("=" * 70)
for pkg in airalo_packages[:3]:
    print(f"  - {pkg['plan_name']}: ${pkg['price']}")

print("\n" + "=" * 70)
print("Nomad 套餐示例:")
print("=" * 70)
for pkg in nomad_packages[:3]:
    print(f"  - {pkg['plan_name']}: ${pkg['price']}")
