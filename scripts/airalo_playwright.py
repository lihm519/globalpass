#!/usr/bin/env python3
"""
Airalo 爬虫 - 使用 Playwright 获取完整套餐信息
"""

import json
import logging
import re
from datetime import datetime
from typing import List, Dict
from playwright.sync_api import sync_playwright

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def scrape_airalo_country(country_name: str, airalo_slug: str) -> List[Dict]:
    """从 Airalo 官网抓取单个国家的数据"""
    try:
        url = f"https://www.airalo.com/{airalo_slug}-esim"
        
        logger.info(f"🌐 正在抓取 Airalo - {country_name}...")
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url, wait_until="networkidle", timeout=30000)
            
            # 等待套餐加载
            page.wait_for_selector('a:has-text("GB")', timeout=10000)
            
            # 获取所有套餐链接
            links = page.query_selector_all('a')
            
            packages = []
            for link in links:
                # 获取 aria-label 属性（hint 属性的来源）
                aria_label = link.get_attribute('aria-label')
                
                if not aria_label:
                    continue
                
                # 解析 aria-label: "Select 1 GB - 3 Days for $4.00 USD."
                match = re.match(r'Select\s+(\d+)\s*GB\s*-\s*(\d+)\s*Days?\s+for\s+\$?([\d.]+)\s*USD', aria_label)
                
                if match:
                    data_amount = match.group(1)
                    validity_days = match.group(2)
                    price_usd = float(match.group(3))
                    validity = f"{validity_days} Day" if validity_days == "1" else f"{validity_days} Days"
                    
                    package = {
                        "provider": "Airalo",
                        "country": country_name,
                        "plan_name": f"{country_name} {data_amount}GB {validity}",
                        "data_type": "Data",
                        "data_amount": f"{data_amount}GB",
                        "validity": validity,
                        "price": price_usd,
                        "network": "Local Operators",
                        "link": url,
                        "raw_data": json.dumps({
                            "original_price": price_usd,
                            "original_currency": "USD",
                            "usd_price": price_usd,
                            "currency": "USD",
                            "data": f"{data_amount}GB",
                            "validity": validity,
                        }),
                        "last_checked": datetime.utcnow().isoformat(),
                    }
                    packages.append(package)
                    logger.debug(f"   ✅ {data_amount}GB {validity} - ${price_usd}")
            
            browser.close()
            
            logger.info(f"✅ Airalo {country_name}: 获取 {len(packages)} 个套餐")
            return packages
            
    except Exception as e:
        logger.error(f"❌ Airalo {country_name}: {e}")
        return []

if __name__ == "__main__":
    # 测试
    packages = scrape_airalo_country("Japan", "japan")
    print(f"\n获取 {len(packages)} 个套餐:")
    for pkg in packages:
        print(f"  - {pkg['plan_name']}: ${pkg['price']}")
