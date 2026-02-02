#!/usr/bin/env python3
"""
Airalo 爬虫最终版 - 从 HTML 中提取套餐名称和价格并匹配
"""

import json
import logging
import re
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from typing import List, Dict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

EUR_TO_USD = 1.1715

def scrape_airalo_country(country_name: str, airalo_slug: str) -> List[Dict]:
    """从 Airalo 官网抓取单个国家的数据"""
    try:
        url = f"https://www.airalo.com/{airalo_slug}-esim"
        
        logger.info(f"🌐 正在抓取 Airalo - {country_name}...")
        
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=15)
        
        if response.status_code != 200:
            logger.warning(f"❌ Airalo {country_name}: HTTP {response.status_code}")
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # 步骤 1: 从 script 标签中提取完整套餐名称 "X GB - Y Days"
        script_tags = soup.find_all('script', string=lambda text: text and 'GB' in text)
        package_names = []
        
        for script in script_tags:
            script_text = script.string
            # 提取套餐名称: "1 GB - 3 Days", "3 GB - 7 Days" 等
            names = re.findall(r'"(\d+) GB - (\d+) Days?"', script_text)
            package_names.extend(names)
        
        # 步骤 2: 从链接文本中提取价格 "1GB4.00 €"
        links = soup.find_all('a')
        price_data = []
        
        for link in links:
            text = link.get_text(strip=True)
            # 匹配格式: "1GB4.00 €" 或 "3GB7.50 €"
            match = re.match(r'^(\d+)GB([\d.]+)\s*€$', text)
            if match:
                data_gb = match.group(1)
                price_eur = float(match.group(2))
                price_data.append((data_gb, price_eur))
        
        logger.debug(f"   找到 {len(package_names)} 个套餐名称")
        logger.debug(f"   找到 {len(price_data)} 个价格")
        
        # 步骤 3: 匹配套餐名称和价格
        packages = []
        
        for data_gb, validity_days in package_names:
            # 查找匹配的价格（相同数据量）
            matching_prices = [price for gb, price in price_data if gb == data_gb]
            
            if matching_prices:
                # 使用第一个匹配的价格
                price_eur = matching_prices[0]
                price_usd = round(price_eur * EUR_TO_USD, 2)
                
                validity = f"{validity_days} Day" if validity_days == "1" else f"{validity_days} Days"
                
                package = {
                    "provider": "Airalo",
                    "country": country_name,
                    "plan_name": f"{country_name} {data_gb}GB {validity}",
                    "data_type": "Data",
                    "data_amount": f"{data_gb}GB",
                    "validity": validity,
                    "price": price_usd,
                    "network": "Local Operators",
                    "link": url,
                    "raw_data": json.dumps({
                        "original_price": price_eur,
                        "original_currency": "EUR",
                        "usd_price": price_usd,
                        "currency": "USD",
                        "data": f"{data_gb}GB",
                        "validity": validity,
                    }),
                    "last_checked": datetime.utcnow().isoformat(),
                }
                packages.append(package)
                logger.debug(f"   ✅ {data_gb}GB {validity} - €{price_eur} → ${price_usd}")
                
                # 移除已使用的价格
                price_data.remove((data_gb, price_eur))
        
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
