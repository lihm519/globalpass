#!/usr/bin/env python3
"""
GlobalPass - 通用爬虫核心系统（网页抓取版）
阶段二：自动化供货系统

功能：
- 从 Airalo 官网网页抓取真实数据
- 货币转换（EUR → USD）
- 无限流量识别
- 有效期清洗
- Upsert 入库
"""

import json
import requests
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional
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

# EUR 到 USD 的汇率（近似值，实际应该使用 API）
EUR_TO_USD = 1.10


class AiraloScraper:
    """Airalo 网页抓取类"""
    
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
            "scraped": 0,
            "upsert_success": 0,
            "upsert_error": 0,
        }
    
    def load_countries(self) -> List[Dict]:
        """加载国家配置"""
        config_file = Path(__file__).parent.parent / "config" / "countries.json"
        
        if not config_file.exists():
            logger.error(f"配置文件不存在: {config_file}")
            return []
        
        with open(config_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def eur_to_usd(self, eur_price: float) -> float:
        """EUR 转 USD"""
        return round(eur_price * EUR_TO_USD, 2)
    
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
            # Airalo 页面中套餐显示为 "1GB4.00 €" 格式的链接文本
            package_links = soup.find_all('a')
            
            validity_map = {}
            current_validity = "7 Days"  # 默认有效期
            
            for link in package_links:
                text = link.get_text(strip=True)
                
                # 检查是否是有效期标签（如 "3 days", "7 days" 等）
                if re.match(r'^\d+\s*days?$', text, re.IGNORECASE):
                    current_validity = text.replace('days', 'Days').replace('day', 'Day')
                    continue
                
                # 解析套餐文本: "1GB4.00 €" 或 "10GB15.00 €"
                match = re.match(r'^(\d+)GB([\d.]+)\s*€$', text)
                
                if match:
                    data_amount = f"{match.group(1)}GB"
                    eur_price = float(match.group(2))
                    usd_price = self.eur_to_usd(eur_price)
                    
                    package = {
                        "provider": "Airalo",
                        "country": country['name'],
                        "plan_name": f"{country['name']} {data_amount} {current_validity}",
                        "data_type": "Fixed",
                        "data_amount": data_amount,
                        "validity": current_validity,
                        "price": usd_price,
                        "network": "Local Operators",
                        "link": f"https://www.airalo.com/{country['airalo_slug']}-esim",
                        "raw_data": json.dumps({
                            "eur_price": eur_price,
                            "usd_price": usd_price,
                            "data": data_amount,
                            "validity": current_validity,
                        }),
                        "last_checked": datetime.utcnow().isoformat(),
                    }
                    packages.append(package)
                
                # 解析无限流量套餐: "Unlimited7.50 €" 或 "UnlimitedData7.50 €"
                unlimited_match = re.match(r'^Unlimited(?:Data)?([\d.]+)\s*€$', text)
                
                if unlimited_match:
                    eur_price = float(unlimited_match.group(1))
                    usd_price = self.eur_to_usd(eur_price)
                    
                    package = {
                        "provider": "Airalo",
                        "country": country['name'],
                        "plan_name": f"{country['name']} Unlimited {current_validity}",
                        "data_type": "Unlimited",
                        "data_amount": "Unlimited",
                        "validity": current_validity,
                        "price": usd_price,
                        "network": "Local Operators",
                        "link": f"https://www.airalo.com/{country['airalo_slug']}-esim",
                        "raw_data": json.dumps({
                            "eur_price": eur_price,
                            "usd_price": usd_price,
                            "data": "Unlimited",
                            "validity": current_validity,
                        }),
                        "last_checked": datetime.utcnow().isoformat(),
                    }
                    packages.append(package)
            
            logger.info(f"✅ Airalo {country['name']}: 获取 {len(packages)} 个套餐")
            self.stats["scraped"] += len(packages)
            return packages
            
        except Exception as e:
            logger.error(f"❌ Airalo {country['name']} 错误: {str(e)[:100]}")
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
                
                if check_response.status_code == 200 and check_response.json():
                    # 已存在，执行更新
                    existing_id = check_response.json()[0]['id']
                    update_url = f"{url}?id=eq.{existing_id}"
                    
                    response = requests.patch(
                        update_url,
                        headers=self.supabase_headers,
                        json=pkg,
                        timeout=10
                    )
                else:
                    # 不存在，执行插入
                    response = requests.post(
                        url,
                        headers=self.supabase_headers,
                        json=pkg,
                        timeout=10
                    )
                
                if response.status_code in [200, 201]:
                    success_count += 1
                    logger.info(f"✅ {pkg['country']} - {pkg['plan_name']}: 入库成功 (${pkg['price']})")
                else:
                    logger.warning(f"⚠️  {pkg['country']}: {response.status_code}")
                    logger.debug(f"   响应: {response.text[:100]}")
                    self.stats["upsert_error"] += 1
                    
            except Exception as e:
                logger.error(f"❌ Upsert 错误: {str(e)[:100]}")
                self.stats["upsert_error"] += 1
        
        self.stats["upsert_success"] += success_count
        return success_count
    
    def run(self):
        """执行爬虫"""
        print("\n" + "=" * 70)
        print("🚀 GlobalPass - Airalo 网页抓取系统启动")
        print("=" * 70)
        
        countries = self.load_countries()
        
        if not countries:
            logger.error("❌ 无可用国家配置")
            return 1
        
        logger.info(f"📍 目标国家: {len(countries)} 个")
        
        # 遍历所有国家
        for country in countries:
            logger.info(f"\n{'='*60}")
            logger.info(f"🌍 处理国家: {country['name']}")
            logger.info(f"{'='*60}")
            
            # 抓取 Airalo 数据
            packages = self.scrape_airalo_country(country)
            if packages:
                self.upsert_to_supabase(packages)
        
        # 输出统计
        print("\n" + "=" * 70)
        print("📊 爬虫执行统计")
        print("=" * 70)
        print(f"抓取套餐: {self.stats['scraped']}")
        print(f"Upsert 成功: {self.stats['upsert_success']}, 失败: {self.stats['upsert_error']}")
        print("=" * 70)
        
        return 0


def main():
    scraper = AiraloScraper()
    return scraper.run()


if __name__ == "__main__":
    import sys
    sys.exit(main())
