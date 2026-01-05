#!/usr/bin/env python3
"""
GlobalPass - 通用爬虫核心系统（网页抓取版 v2）
功能：
- 从 Airalo 官网抓取欧元价格并转换为美元
- 从 Nomad 官网抓取新加坡元价格并转换为美元
- 统一前端显示美元价格
"""
import json
import requests
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict
import re
from bs4 import BeautifulSoup

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Supabase 配置
SUPABASE_URL = "https://mzodnvjtlujvvwfnpcyb.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16b2Rudmp0bHVqdnZ3Zm5wY3liIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0MDk4NiwiZXhwIjoyMDgzMTE2OTg2fQ.gr-5J22EhV08PLghNcoS8o5lUFjaEyby21MwE-35ENs"

# 汇率配置（2026年1月5日）
EXCHANGE_RATES = {
    "EUR": 1.17,  # 1 EUR = 1.17 USD
    "SGD": 0.78,  # 1 SGD = 0.78 USD
    "USD": 1.00,  # 1 USD = 1.00 USD
    "CNY": 0.14,  # 1 CNY = 0.14 USD
    "GBP": 1.27,  # 1 GBP = 1.27 USD
}

class UniversalScraper:
    """通用爬虫类 - 支持 Airalo 和 Nomad"""
    
    def __init__(self):
        self.supabase_headers = {
            "apikey": SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
        }
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        })
        self.stats = {
            "airalo_scraped": 0,
            "nomad_scraped": 0,
            "upsert_success": 0,
            "upsert_error": 0,
        }
    
    def convert_to_usd(self, price: float, currency: str) -> float:
        """将价格转换为美元"""
        rate = EXCHANGE_RATES.get(currency, 1.0)
        return round(price * rate, 2)
    
    def load_countries(self) -> List[Dict]:
        """加载国家配置"""
        config_file = Path(__file__).parent.parent / "config" / "countries.json"
        
        if not config_file.exists():
            logger.error(f"配置文件不存在: {config_file}")
            return []
        
        with open(config_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def scrape_airalo_country(self, country: Dict) -> List[Dict]:
        """从 Airalo 官网抓取单个国家的数据"""
        try:
            url = f"https://www.airalo.com/{country['airalo_slug']}-esim"
            
            logger.info(f"🌐 正在抓取 Airalo - {country['name']}...")
            
            response = self.session.get(url, timeout=15)
            
            if response.status_code != 200:
                logger.warning(f"❌ Airalo {country['name']}: HTTP {response.status_code}")
                return []
            
            soup = BeautifulSoup(response.content, 'html.parser')
            packages = []
            
            # 查找所有套餐链接
            package_links = soup.find_all('a')
            
            current_validity = "7 Days"  # 默认有效期
            
            for link in package_links:
                text = link.get_text(strip=True)
                
                # 检查是否是有效期标签
                if re.match(r'^\d+\s*days?$', text, re.IGNORECASE):
                    current_validity = text.replace('days', 'Days').replace('day', 'Day')
                    continue
                
                # 解析标准套餐: "1GB4.00 €"
                standard_match = re.match(r'^(\d+)\s*GB([\d.]+)\s*€$', text)
                
                if standard_match:
                    data_amount = standard_match.group(1)
                    price_eur = float(standard_match.group(2))
                    price_usd = self.convert_to_usd(price_eur, "EUR")
                    
                    package = {
                        "provider": "Airalo",
                        "country": country['name'],
                        "plan_name": f"{country['name']} {data_amount}GB {current_validity}",
                        "data_type": "Data",
                        "data_amount": f"{data_amount}GB",
                        "validity": current_validity,
                        "price": price_usd,
                        "network": "Local Operators",
                        "link": f"https://www.airalo.com/{country['airalo_slug']}-esim",
                        "raw_data": json.dumps({
                            "original_price": price_eur,
                            "original_currency": "EUR",
                            "usd_price": price_usd,
                            "currency": "USD",
                            "data": f"{data_amount}GB",
                            "validity": current_validity,
                        }),
                        "last_checked": datetime.utcnow().isoformat(),
                    }
                    packages.append(package)
                    logger.debug(f"   ✅ 标准套餐: {data_amount}GB €{price_eur} → ${price_usd}")
                
                # 解析无限流量套餐: "Unlimited7.50 €"
                unlimited_match = re.match(r'^Unlimited(?:Data)?([\d.]+)\s*€$', text)
                
                if unlimited_match:
                    price_eur = float(unlimited_match.group(1))
                    price_usd = self.convert_to_usd(price_eur, "EUR")
                    
                    package = {
                        "provider": "Airalo",
                        "country": country['name'],
                        "plan_name": f"{country['name']} Unlimited {current_validity}",
                        "data_type": "Unlimited",
                        "data_amount": "Unlimited",
                        "validity": current_validity,
                        "price": price_usd,
                        "network": "Local Operators",
                        "link": f"https://www.airalo.com/{country['airalo_slug']}-esim",
                        "raw_data": json.dumps({
                            "original_price": price_eur,
                            "original_currency": "EUR",
                            "usd_price": price_usd,
                            "currency": "USD",
                            "data": "Unlimited",
                            "validity": current_validity,
                        }),
                        "last_checked": datetime.utcnow().isoformat(),
                    }
                    packages.append(package)
                    logger.debug(f"   ✅ 无限套餐: Unlimited €{price_eur} → ${price_usd}")
            
            logger.info(f"✅ Airalo {country['name']}: 获取 {len(packages)} 个套餐")
            self.stats["airalo_scraped"] += len(packages)
            return packages
            
        except Exception as e:
            logger.error(f"❌ Airalo {country['name']} 错误: {str(e)[:100]}")
            return []
    
    def scrape_nomad_country(self, country: Dict) -> List[Dict]:
        """从 Nomad 官网抓取单个国家的数据"""
        try:
            nomad_slug = country['nomad_slug'].replace('_', '-')
            url = f"https://www.getnomad.app/{nomad_slug}-esim"
            
            logger.info(f"🌐 正在抓取 Nomad - {country['name']}...")
            
            response = self.session.get(url, timeout=15)
            
            if response.status_code != 200:
                logger.warning(f"❌ Nomad {country['name']}: HTTP {response.status_code}")
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
                validity = f"{validity_days} Days"
                
                # 匹配价格 (USD/SGD/EUR)
                price_match = re.search(r'(USD|SGD|EUR)\s*([\d.]+)', text_clean)
                if not price_match:
                    continue
                
                currency = price_match.group(1)
                price_value = float(price_match.group(2))
                
                # 转换为美元
                price_usd = self.convert_to_usd(price_value, currency)
                
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
                    "country": country['name'],
                    "plan_name": f"{country['name']} {data_str.strip()} {validity}",
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
            
            logger.info(f"✅ Nomad {country['name']}: 获取 {len(packages)} 个套餐")
            self.stats["nomad_scraped"] += len(packages)
            return packages
            
        except Exception as e:
            logger.error(f"❌ Nomad {country['name']} 错误: {str(e)[:100]}")
            return []
    
    def upsert_to_supabase(self, packages: List[Dict]) -> int:
        """Upsert 数据到 Supabase"""
        if not packages:
            return 0
        
        success_count = 0
        
        for pkg in packages:
            try:
                url = f"{SUPABASE_URL}/rest/v1/esim_packages"
                
                # 检查是否已存在
                check_url = f"{url}?provider=eq.{pkg['provider']}&country=eq.{pkg['country']}&plan_name=eq.{pkg['plan_name']}"
                
                check_response = requests.get(
                    check_url,
                    headers=self.supabase_headers,
                    timeout=10
                )
                
                existing = check_response.json()
                
                if existing:
                    # 更新
                    record_id = existing[0]['id']
                    update_url = f"{url}?id=eq.{record_id}"
                    
                    response = requests.patch(
                        update_url,
                        headers=self.supabase_headers,
                        json=pkg,
                        timeout=10
                    )
                else:
                    # 插入
                    response = requests.post(
                        url,
                        headers=self.supabase_headers,
                        json=pkg,
                        timeout=10
                    )
                
                if response.status_code in [200, 201]:
                    success_count += 1
                    self.stats["upsert_success"] += 1
                else:
                    logger.warning(f"⚠️  Upsert 失败: {pkg['plan_name']} - {response.status_code}")
                    self.stats["upsert_error"] += 1
                    
            except Exception as e:
                logger.error(f"❌ Upsert 错误: {pkg['plan_name']} - {str(e)[:50]}")
                self.stats["upsert_error"] += 1
        
        return success_count
    
    def run(self):
        """运行爬虫"""
        logger.info("🚀 GlobalPass 通用爬虫启动...")
        logger.info(f"📅 汇率更新时间: 2026-01-05")
        logger.info(f"💱 EUR→USD: {EXCHANGE_RATES['EUR']}, SGD→USD: {EXCHANGE_RATES['SGD']}\n")
        
        countries = self.load_countries()
        logger.info(f"📍 目标国家: {len(countries)} 个\n")
        
        all_packages = []
        
        for country in countries:
            logger.info("=" * 60)
            logger.info(f"🌍 处理国家: {country['name']}")
            logger.info("=" * 60)
            
            # 抓取 Airalo
            airalo_packages = self.scrape_airalo_country(country)
            all_packages.extend(airalo_packages)
            
            # 抓取 Nomad
            nomad_packages = self.scrape_nomad_country(country)
            all_packages.extend(nomad_packages)
        
        # Upsert 到数据库
        logger.info("\n" + "=" * 60)
        logger.info("📤 正在更新数据库...")
        logger.info("=" * 60)
        
        success_count = self.upsert_to_supabase(all_packages)
        
        # 统计报告
        logger.info("\n" + "=" * 60)
        logger.info("📊 爬虫统计报告")
        logger.info("=" * 60)
        logger.info(f"✅ Airalo 抓取: {self.stats['airalo_scraped']} 个套餐")
        logger.info(f"✅ Nomad 抓取: {self.stats['nomad_scraped']} 个套餐")
        logger.info(f"✅ 数据库更新成功: {self.stats['upsert_success']} 条")
        logger.info(f"❌ 数据库更新失败: {self.stats['upsert_error']} 条")
        logger.info("=" * 60)

if __name__ == "__main__":
    scraper = UniversalScraper()
    scraper.run()
