#!/usr/bin/env python3
"""
Airalo 爬虫 V3 - 解析 JavaScript 中的 JSON 数据
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

# 汇率
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
        packages = []
        
        # 查找包含 JSON 数据的 script 标签
        script_tags = soup.find_all('script', string=lambda text: text and '"title":' in text and 'GB' in text)
        
        for script in script_tags:
            script_text = script.string
            
            # 提取所有套餐名称: "1 GB - 3 Days"
            title_matches = re.findall(r'"(\d+ GB - \d+ Days)"', script_text)
            
            # 匹配价格: "4.00 €"
            price_matches = re.findall(r'"([\d.]+) €"', script_text)
            
            logger.debug(f"   找到 {len(title_matches)} 个标题, {len(price_matches)} 个价格")
            
            # 匹配套餐名称和价格（每个套餐有 2 个价格，取第一个）
            for i, title in enumerate(title_matches):
                # 解析标题: "1 GB - 3 Days"
                standard_match = re.match(r'^(\d+)\s*GB\s*-\s*(\d+)\s*Days?$', title, re.IGNORECASE)
                
                if standard_match and i * 2 < len(price_matches):
                    data_amount = standard_match.group(1)
                    validity_days = standard_match.group(2)
                    validity = f"{validity_days} Day" if validity_days == "1" else f"{validity_days} Days"
                    price_eur = float(price_matches[i * 2])  # 每个套餐有 2 个价格
                    price_usd = round(price_eur * EUR_TO_USD, 2)
                    
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
                            "original_price": price_eur,
                            "original_currency": "EUR",
                            "usd_price": price_usd,
                            "currency": "USD",
                            "data": f"{data_amount}GB",
                            "validity": validity,
                        }),
                        "last_checked": datetime.utcnow().isoformat(),
                    }
                    packages.append(package)
                    logger.debug(f"   ✅ {data_amount}GB {validity} €{price_eur} → ${price_usd}")
        
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
