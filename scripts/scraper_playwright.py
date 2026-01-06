#!/usr/bin/env python3
"""
GlobalPass 自动化价格爬虫 (Playwright 版本)
- 抓取 Airalo 和 Nomad 的美元价格
- 支持所有 20 个国家
- 每天自动运行（GitHub Actions）
"""

import json
import re
import time
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
import os
import sys

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.supabase_client import supabase

# 加载国家配置
config_file = 'config/countries_test.json' if os.path.exists('config/countries_test.json') else 'config/countries.json'
with open(config_file, 'r', encoding='utf-8') as f:
    COUNTRIES = json.load(f)
print(f"使用配置文件: {config_file}")
print(f"将抓取 {len(COUNTRIES)} 个国家")
for c in COUNTRIES:
    print(f"  - {c['name']}")
print()

def scrape_airalo_country(page, country):
    """抓取 Airalo 某个国家的所有套餐"""
    country_name = country['name']
    airalo_slug = country['airalo_slug']
    
    print(f"\n[Airalo] 正在抓取 {country_name}...")
    
    try:
        # 访问 Airalo 国家页面（添加 ?currency=USD 参数）
        url = f"https://www.airalo.com/{airalo_slug}-esim?currency=USD"
        page.goto(url, wait_until="networkidle", timeout=30000)
        
        # 等待页面加载完成
        time.sleep(5)
        
        # 查找所有套餐容器
        package_containers = page.query_selector_all('[data-testid="card-package_container"]')
        
        packages = []
        for container in package_containers:
            try:
                # 提取文本内容
                text = container.inner_text()
                
                # 解析数据量
                data_match = re.search(r'(\d+(?:\.\d+)?)\s*(GB|MB)', text, re.IGNORECASE)
                if not data_match:
                    continue
                
                data_value = float(data_match.group(1))
                data_unit = data_match.group(2).upper()
                data_amount = f"{data_value} {data_unit}"
                
                # 解析有效期
                validity_match = re.search(r'(\d+)\s*DAYS?', text, re.IGNORECASE)
                if not validity_match:
                    continue
                
                validity_days = int(validity_match.group(1))
                validity = f"{validity_days} Days"
                
                # 解析价格
                price_match = re.search(r'\$([0-9.]+)', text)
                if not price_match:
                    continue
                
                price_usd = float(price_match.group(1))
            except Exception as e:
                print(f"  解析套餐失败: {e}")
                continue
            
            # 转换为 GB
            if data_unit == 'MB':
                data_gb = data_value / 1024
            else:
                data_gb = data_value
            
            package = {
                'provider': 'Airalo',
                'country': country_name,
                'package_name': f"{country_name} {data_amount} {validity}",
                'data_amount': data_amount,
                'data_gb': data_gb,
                'validity': validity,
                'validity_days': validity_days,
                'price': price_usd,
                'currency': 'USD',
                'url': url
            }
            
            packages.append(package)
        
        print(f"[Airalo] {country_name}: 获取 {len(packages)} 个套餐")
        return packages
    
    except Exception as e:
        print(f"[Airalo] {country_name} 抓取失败: {e}")
        return []

def scrape_nomad_country(page, country):
    """抓取 Nomad 某个国家的所有套餐"""
    country_name = country['name']
    nomad_code = country.get('nomad_code')
    
    if not nomad_code:
        print(f"[Nomad] {country_name}: 跳过（无 nomad_code）")
        return []
    
    print(f"\n[Nomad] 正在抓取 {country_name}...")
    
    try:
        # 访问 Nomad 国家页面
        url = f"https://www.getnomad.app/{nomad_code}-eSIM"
        page.goto(url, wait_until="networkidle", timeout=30000)
        
        # 等待页面加载完成
        time.sleep(2)
        
        # 查找所有 "Plan Details" 按钮
        plan_buttons = page.query_selector_all('button:has-text("Plan Details")')
        
        packages = []
        for button in plan_buttons:
            try:
                # 获取按钮的父容器
                container = button.evaluate('el => el.closest("li, div")')
                if not container:
                    continue
                
                # 提取文本内容
                text = button.evaluate('el => el.closest("li, div").innerText')
                
                # 解析数据量
                data_match = re.search(r'(Unlimited|\d+(?:\.\d+)?)\s*(GB|MB)', text, re.IGNORECASE)
                if not data_match:
                    continue
                
                data_str = data_match.group(1)
                if data_str.lower() == 'unlimited':
                    data_amount = 'Unlimited'
                    data_gb = None
                else:
                    data_value = float(data_str)
                    data_unit = data_match.group(2).upper()
                    
                    if data_unit == 'MB':
                        data_value = data_value / 1024
                    
                    data_amount = f"{data_str} {data_unit}"
                    data_gb = data_value
                
                # 解析有效期
                validity_match = re.search(r'For\s+(\d+)\s+DAYS?', text, re.IGNORECASE)
                if not validity_match:
                    continue
                
                validity_days = int(validity_match.group(1))
                validity = f"{validity_days} Days"
                
                # 解析价格
                price_match = re.search(r'USD\s*([0-9.]+)', text)
                if not price_match:
                    continue
                
                price_usd = float(price_match.group(1))
                
                package = {
                    'provider': 'Nomad',
                    'country': country_name,
                    'package_name': f"{country_name} {data_amount} {validity}",
                    'data_amount': data_amount,
                    'data_gb': data_gb,
                    'validity': validity,
                    'validity_days': validity_days,
                    'price': price_usd,
                    'currency': 'USD',
                    'url': url
                }
                
                packages.append(package)
            
            except Exception as e:
                print(f"[Nomad] 解析套餐失败: {e}")
                continue
        
        print(f"[Nomad] {country_name}: 获取 {len(packages)} 个套餐")
        return packages
    
    except Exception as e:
        print(f"[Nomad] {country_name} 抓取失败: {e}")
        return []

def update_database(packages):
    """更新数据库"""
    print(f"\n开始更新数据库...")
    
    for package in packages:
        try:
            # 查找现有记录
            result = supabase.table('esim_packages').select('*').eq(
                'provider', package['provider']
            ).eq(
                'country', package['country']
            ).eq(
                'package_name', package['package_name']
            ).execute()
            
            if result.data:
                # 更新现有记录
                supabase.table('esim_packages').update({
                    'price': package['price'],
                    'currency': package['currency'],
                    'data_amount': package['data_amount'],
                    'data_gb': package['data_gb'],
                    'validity': package['validity'],
                    'validity_days': package['validity_days'],
                    'url': package['url']
                }).eq('id', result.data[0]['id']).execute()
                
                print(f"✅ 更新: {package['provider']} - {package['package_name']} - ${package['price']}")
            else:
                # 插入新记录
                supabase.table('esim_packages').insert(package).execute()
                
                print(f"✅ 新增: {package['provider']} - {package['package_name']} - ${package['price']}")
        
        except Exception as e:
            print(f"❌ 数据库更新失败: {package['package_name']} - {e}")

def main():
    """主函数"""
    print("=" * 60)
    print("GlobalPass 自动化价格爬虫")
    print("=" * 60)
    
    all_packages = []
    
    with sync_playwright() as p:
        # 启动浏览器
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        page = context.new_page()
        
        # 遍历所有国家
        for country in COUNTRIES:
            # 抓取 Airalo
            airalo_packages = scrape_airalo_country(page, country)
            all_packages.extend(airalo_packages)
            
            # 抓取 Nomad
            nomad_packages = scrape_nomad_country(page, country)
            all_packages.extend(nomad_packages)
            
            # 避免请求过快
            time.sleep(2)
        
        browser.close()
    
    print(f"\n总共抓取 {len(all_packages)} 个套餐")
    
    # 更新数据库
    update_database(all_packages)
    
    print("\n✅ 爬虫运行完成！")

if __name__ == '__main__':
    main()
