#!/usr/bin/env python3
"""
GlobalPass 混合爬虫
- Airalo: 使用 Playwright（获取 JavaScript 渲染后的 hint 属性）
- Nomad: 使用 BeautifulSoup（页面结构简单）
"""

import json
import logging
import re
import requests
from pathlib import Path
from datetime import datetime
from typing import List, Dict
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Supabase 配置
SUPABASE_URL = "https://mzodnvjtlujvvwfnpcyb.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16b2Rudmp0bHVqdnZ3Zm5wY3liIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0MDk4NiwiZXhwIjoyMDgzMTE2OTg2fQ.gr-5J22EhV08PLghNcoS8o5lUFjaEyby21MwE-35ENs"

# 备用固定汇率
FALLBACK_EXCHANGE_RATES = {
    "EUR": 1.17,
    "SGD": 0.78
}

class HybridScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.exchange_rates = self.get_exchange_rates()
    
    def get_exchange_rates(self) -> Dict[str, float]:
        """获取实时汇率"""
        try:
            logger.info("📊 正在获取实时汇率...")
            response = self.session.get("https://open.er-api.com/v6/latest/USD", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                rates = data['rates']
                
                # 计算 EUR 和 SGD 对 USD 的汇率
                exchange_rates = {
                    "EUR": round(1 / rates['EUR'], 4),  # EUR to USD
                    "SGD": round(1 / rates['SGD'], 4)   # SGD to USD
                }
                
                logger.info(f"✅ 实时汇率获取成功:")
                logger.info(f"   EUR: {exchange_rates['EUR']}")
                logger.info(f"   SGD: {exchange_rates['SGD']}")
                logger.info(f"   更新时间: {data['time_last_update_utc']}")
                
                return exchange_rates
            else:
                logger.warning(f"⚠️ 汇率 API 返回错误: {response.status_code}")
                logger.warning(f"   使用备用固定汇率")
                return FALLBACK_EXCHANGE_RATES
        except Exception as e:
            logger.error(f"❌ 获取实时汇率失败: {e}")
            logger.warning(f"   使用备用固定汇率")
            return FALLBACK_EXCHANGE_RATES
    
    def convert_to_usd(self, price: float, currency: str) -> float:
        """将价格转换为美元"""
        rate = self.exchange_rates.get(currency, 1.0)
        return round(price * rate, 2)
    
    def load_countries(self) -> List[Dict]:
        """加载国家配置"""
        config_file = Path(__file__).parent.parent / "config" / "countries.json"
        
        if not config_file.exists():
            logger.error(f"配置文件不存在: {config_file}")
            return []
        
        with open(config_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def scrape_airalo_with_playwright(self, country: Dict) -> List[Dict]:
        """使用 Playwright 抓取 Airalo 数据"""
        try:
            url = f"https://www.airalo.com/{country['airalo_slug']}-esim"
            
            logger.info(f"🌐 正在抓取 Airalo - {country['name']} (Playwright)...")
            
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.goto(url, wait_until="networkidle", timeout=30000)
                
                # 等待套餐加载
                page.wait_for_selector('a[hint*="Select"]', timeout=10000)
                
                # 获取所有包含 hint 属性的链接
                links = page.query_selector_all('a[hint*="Select"]')
                
                packages = []
                for link in links:
                    hint = link.get_attribute('hint')
                    
                    if not hint:
                        continue
                    
                    # 解析 hint: "Select 1 GB - 3 Days for $4.00 USD."
                    match = re.match(r'Select\s+(\d+)\s*GB\s*-\s*(\d+)\s*Days?\s+for\s+\$?([\d.]+)\s*USD', hint)
                    
                    if match:
                        data_amount = match.group(1)
                        validity_days = match.group(2)
                        price_usd = float(match.group(3))
                        validity = f"{validity_days} Day" if validity_days == "1" else f"{validity_days} Days"
                        
                        package = {
                            "provider": "Airalo",
                            "country": country['name'],
                            "plan_name": f"{country['name']} {data_amount}GB {validity}",
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
                
                logger.info(f"✅ Airalo {country['name']}: 获取 {len(packages)} 个套餐")
                return packages
                
        except Exception as e:
            logger.error(f"❌ Airalo {country['name']}: {e}")
            return []
    
    def scrape_nomad_with_bs4(self, country: Dict) -> List[Dict]:
        """使用 BeautifulSoup 抓取 Nomad 数据"""
        try:
            url = f"https://www.getnomad.app/shop?country={country['nomad_code']}"
            
            logger.info(f"🌐 正在抓取 Nomad - {country['name']} (BeautifulSoup)...")
            
            response = self.session.get(url, timeout=15)
            
            if response.status_code != 200:
                logger.warning(f"❌ Nomad {country['name']}: HTTP {response.status_code}")
                return []
            
            soup = BeautifulSoup(response.content, 'html.parser')
            packages = []
            
            # 查找所有套餐容器
            plan_containers = soup.find_all('div', class_=re.compile(r'plan|package|card'))
            
            for container in plan_containers:
                text = container.get_text(strip=True)
                
                # 解析标准套餐: "1 GB For 7 DAYS USD 4"
                standard_match = re.search(r'(\d+)\s*GB.*?(\d+)\s*DAYS.*?USD\s*([\d.]+)', text, re.IGNORECASE)
                
                if standard_match:
                    data_amount = standard_match.group(1)
                    validity_days = standard_match.group(2)
                    price_usd = float(standard_match.group(3))
                    validity = f"{validity_days} Day" if validity_days == "1" else f"{validity_days} Days"
                    
                    package = {
                        "provider": "Nomad",
                        "country": country['name'],
                        "plan_name": f"{country['name']} {data_amount} GB {validity}",
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
                
                # 解析无限流量套餐: "Unlimited 3 DAYS USD 11"
                unlimited_match = re.search(r'Unlimited.*?(\d+)\s*DAYS.*?USD\s*([\d.]+)', text, re.IGNORECASE)
                
                if unlimited_match:
                    validity_days = unlimited_match.group(1)
                    price_usd = float(unlimited_match.group(2))
                    validity = f"{validity_days} Day" if validity_days == "1" else f"{validity_days} Days"
                    
                    package = {
                        "provider": "Nomad",
                        "country": country['name'],
                        "plan_name": f"{country['name']} Unlimited {validity}",
                        "data_type": "Unlimited",
                        "data_amount": "Unlimited",
                        "validity": validity,
                        "price": price_usd,
                        "network": "Local Operators",
                        "link": url,
                        "raw_data": json.dumps({
                            "original_price": price_usd,
                            "original_currency": "USD",
                            "usd_price": price_usd,
                            "currency": "USD",
                            "data": "Unlimited",
                            "validity": validity,
                        }),
                        "last_checked": datetime.utcnow().isoformat(),
                    }
                    packages.append(package)
                    logger.debug(f"   ✅ Unlimited {validity} - ${price_usd}")
            
            logger.info(f"✅ Nomad {country['name']}: 获取 {len(packages)} 个套餐")
            return packages
            
        except Exception as e:
            logger.error(f"❌ Nomad {country['name']}: {e}")
            return []
    
    def update_database(self, packages: List[Dict]) -> None:
        """更新数据库"""
        headers = {
            "apikey": SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
        }
        
        success_count = 0
        fail_count = 0
        
        for package in packages:
            try:
                response = requests.post(
                    f"{SUPABASE_URL}/rest/v1/esim_packages",
                    headers=headers,
                    json=package,
                    timeout=10
                )
                
                if response.status_code in [200, 201, 204]:
                    success_count += 1
                else:
                    fail_count += 1
                    logger.debug(f"   更新失败: {package['plan_name']} - HTTP {response.status_code}")
                    
            except Exception as e:
                fail_count += 1
                logger.debug(f"   更新失败: {package['plan_name']} - {e}")
        
        logger.info(f"📊 数据库更新完成: 成功 {success_count}, 失败 {fail_count}")
    
    def run(self):
        """运行爬虫"""
        logger.info("="*70)
        logger.info("🚀 GlobalPass 混合爬虫启动")
        logger.info("="*70)
        
        countries = self.load_countries()
        
        if not countries:
            logger.error("❌ 没有找到国家配置")
            return
        
        logger.info(f"📍 加载 {len(countries)} 个国家配置")
        
        all_packages = []
        
        for country in countries:
            # 抓取 Airalo 数据（使用 Playwright）
            airalo_packages = self.scrape_airalo_with_playwright(country)
            all_packages.extend(airalo_packages)
            
            # 抓取 Nomad 数据（使用 BeautifulSoup）
            nomad_packages = self.scrape_nomad_with_bs4(country)
            all_packages.extend(nomad_packages)
        
        logger.info("="*70)
        logger.info(f"📊 抓取完成:")
        logger.info(f"   - 总套餐数: {len(all_packages)}")
        logger.info("="*70)
        
        # 更新数据库
        if all_packages:
            logger.info("💾 正在更新数据库...")
            self.update_database(all_packages)
        
        logger.info("="*70)
        logger.info("✅ 爬虫运行完成")
        logger.info("="*70)

if __name__ == "__main__":
    scraper = HybridScraper()
    scraper.run()
