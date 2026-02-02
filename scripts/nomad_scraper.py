#!/usr/bin/env python3
"""
Nomad 爬虫
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

# 汇率（相对于 USD）
EXCHANGE_RATES = {
    "USD": 1.0,
    "EUR": 1.1715,
    "SGD": 0.7518,
}

def convert_to_usd(amount: float, currency: str) -> float:
    """转换货币到美元"""
    rate = EXCHANGE_RATES.get(currency, 1.0)
    return round(amount * rate, 2)

def scrape_nomad_country(country_name: str, nomad_slug: str) -> List[Dict]:
    """从 Nomad 官网抓取单个国家的数据"""
    try:
        nomad_slug = nomad_slug.replace('_', '-')
        url = f"https://www.getnomad.app/{nomad_slug}-esim"
        
        logger.info(f"🌐 正在抓取 Nomad - {country_name}...")
        
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=15)
        
        if response.status_code != 200:
            logger.warning(f"❌ Nomad {country_name}: HTTP {response.status_code}")
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        packages = []
        
        # 查找所有套餐 <li> 元素
        plan_items = soup.find_all('li')
        
        for item in plan_items:
            text = item.get_text(strip=True)
            
            # 跳过不包含币种的项目
            if 'USD' not in text and 'SGD' not in text and 'EUR' not in text:
                continue
            
            # 移除 "Plan Details" 前缀
            text_clean = text.replace('Plan Details', '').strip()
            
            # 匹配数据量
            data_match = re.search(r'(\d+)\s*GB|Unlimited', text_clean)
            if not data_match:
                continue
            
            data_str = data_match.group(0)
            
            # 匹配有效期
            validity_match = re.search(r'For\s+(\d+)\s*DAYS', text_clean, re.IGNORECASE)
            if not validity_match:
                continue
            
            validity_days = validity_match.group(1)
            validity = f"{validity_days} Day" if validity_days == "1" else f"{validity_days} Days"
            
            # 匹配价格 (USD/SGD/EUR)
            price_match = re.search(r'(USD|SGD|EUR)\s*([\d.]+)', text_clean)
            if not price_match:
                continue
            
            currency = price_match.group(1)
            price_value = float(price_match.group(2))
            
            # 转换为美元
            price_usd = convert_to_usd(price_value, currency)
            
            # 判断是否是无限流量
            is_unlimited = 'Unlimited' in data_str
            
            if is_unlimited:
                data_amount = "Unlimited"
                data_type = "Unlimited"
            else:
                data_amount = data_str.replace(' GB', 'GB').strip()
                data_type = "Data"
            
            package = {
                "provider": "Nomad",
                "country": country_name,
                "plan_name": f"{country_name} {data_str.strip()} {validity}",
                "data_type": data_type,
                "data_amount": data_amount,
                "validity": validity,
                "price": price_usd,
                "network": "Local Operators",
                "link": f"https://www.getnomad.app/{nomad_slug}-esim",
                "raw_data": json.dumps({
                    "original_currency": currency,
                    "original_price": price_value,
                    "usd_price": price_usd,
                    "currency": "USD",
                    "data": data_str.strip(),
                    "validity": validity,
                }),
                "last_checked": datetime.utcnow().isoformat(),
            }
            packages.append(package)
            logger.debug(f"   ✅ 套餐: {data_str.strip()} {validity} {currency}{price_value} → ${price_usd}")
        
        logger.info(f"✅ Nomad {country_name}: 获取 {len(packages)} 个套餐")
        return packages
        
    except Exception as e:
        logger.error(f"❌ Nomad {country_name} 错误: {str(e)[:100]}")
        return []

if __name__ == "__main__":
    # 测试
    packages = scrape_nomad_country("Japan", "japan")
    print(f"\n获取 {len(packages)} 个套餐:")
    for pkg in packages:
        print(f"  - {pkg['plan_name']}: ${pkg['price']}")
