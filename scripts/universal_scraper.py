#!/usr/bin/env python3
"""
GlobalPass - 通用爬虫核心系统（网页抓取版）
阶段二：自动化供货系统
功能：
- 从 Airalo 官网网页抓取真实数据
- 从 Nomad 官网网页抓取真实数据
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

# 注意：不再使用汇率转换，直接使用提供商的原始价格

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
    
    def load_countries(self) -> List[Dict]:
        """加载国家配置"""
        config_file = Path(__file__).parent.parent / "config" / "countries.json"
        
        if not config_file.exists():
            logger.error(f"配置文件不存在: {config_file}")
            return []
        
        with open(config_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    # 已移除汇率转换函数，使用提供商原始价格
    
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
            
            validity_map = {}
            current_validity = "7 Days"  # 默认有效期
            
            for link in package_links:
                text = link.get_text(strip=True)
                
                # 检查是否是有效期标签（如 "3 days", "7 days" 等）
                if re.match(r'^\d+\s*days?$', text, re.IGNORECASE):
                    current_validity = text.replace('days', 'Days').replace('day', 'Day')
                    logger.debug(f"   📅 检测到有效期: {current_validity}")
                    continue
                
                # 解析标准套餐: "1GB4.00 €" 或 "1GB4.00€" 格式
                standard_match = re.match(r'^(\d+)\s*GB([\d.]+)\s*€$', text)
                
                if standard_match:
                    data_amount = standard_match.group(1)
                    price = float(standard_match.group(2))
                    
                    package = {
                        "provider": "Airalo",
                        "country": country['name'],
                        "plan_name": f"{country['name']} {data_amount}GB {current_validity}",
                        "data_type": "Data",
                        "data_amount": f"{data_amount}GB",
                        "validity": current_validity,
                        "price": price,
                        "network": "Local Operators",
                        "link": f"https://www.airalo.com/{country['airalo_slug']}-esim",
                        "raw_data": json.dumps({
                            "original_price": price,
                            "currency": "EUR",
                            "data": f"{data_amount}GB",
                            "validity": current_validity,
                        }),
                        "last_checked": datetime.utcnow().isoformat(),
                    }
                    packages.append(package)
                    logger.debug(f"   ✅ 标准套餐: {data_amount}GB €{price}")
                
                # 解析无限流量套餐: "Unlimited7.50 €" 或 "UnlimitedData7.50 €"
                unlimited_match = re.match(r'^Unlimited(?:Data)?([\d.]+)\s*€$', text)
                
                if unlimited_match:
                    price = float(unlimited_match.group(1))
                    
                    package = {
                        "provider": "Airalo",
                        "country": country['name'],
                        "plan_name": f"{country['name']} Unlimited {current_validity}",
                        "data_type": "Unlimited",
                        "data_amount": "Unlimited",
                        "validity": current_validity,
                        "price": price,
                        "network": "Local Operators",
                        "link": f"https://www.airalo.com/{country['airalo_slug']}-esim",
                        "raw_data": json.dumps({
                            "original_price": price,
                            "currency": "EUR",
                            "data": "Unlimited",
                            "validity": current_validity,
                        }),
                        "last_checked": datetime.utcnow().isoformat(),
                    }
                    packages.append(package)
                    logger.debug(f"   ✅ 无限套餐: Unlimited €{price}")
            
            logger.info(f"✅ Airalo {country['name']}: 获取 {len(packages)} 个套餐")
            self.stats["airalo_scraped"] += len(packages)
            return packages
            
        except Exception as e:
            logger.error(f"❌ Airalo {country['name']} 错误: {str(e)[:100]}")
            return []
    
    def scrape_nomad_country(self, country: Dict) -> List[Dict]:
        """从 Nomad 官网抓取单个国家的数据"""
        try:
            # 构建 Nomad URL
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
                
                # 跳过不包含 SGD 或 EUR 的项目
                if 'SGD' not in text and 'EUR' not in text:
                    continue
                
                # 提取数据量、有效期和价格
                # 格式: "Plan Details1 GBFor 7 DAYSSGD5.14" 或 "Plan DetailsUnlimitedFor 3 DAYSSGD14.15"
                
                # 移除 "Plan Details" 前缀
                text_clean = text.replace('Plan Details', '').strip()
                
                # 匹配数据量
                data_match = re.search(r'(\d+)\s*GB|Unlimited', text_clean)
                if not data_match:
                    continue
                
                data_str = data_match.group(0)  # "1 GB" 或 "Unlimited"
                
                # 匹配有效期
                validity_match = re.search(r'For\s+(\d+)\s*DAYS', text_clean, re.IGNORECASE)
                if not validity_match:
                    continue
                
                validity_days = validity_match.group(1)
                validity = f"{validity_days} Days"
                
                # 匹配价格 (SGD 或 EUR)
                price_match = re.search(r'(SGD|EUR)([\d.]+)', text_clean)
                if not price_match:
                    continue
                
                currency = price_match.group(1)
                price_value = float(price_match.group(2))
                
                # 使用原始价格，不进行汇率转换
                original_price = price_value
                
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
                    "price": original_price,
                    "network": "Local Operators",
                    "link": f"https://www.getnomad.app/{nomad_slug}-esim",
                    "raw_data": json.dumps({
                        "currency": currency,
                        "original_price": price_value,
                        "data": data_str.strip(),
                        "validity": validity,
                    }),
                    "last_checked": datetime.utcnow().isoformat(),
                }
                packages.append(package)
                logger.debug(f"   ✅ 套餐: {data_str.strip()} {validity} {currency}{price_value}")
            
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
                
                if response.status_code in [200, 201, 204]:
                    success_count += 1
                    logger.info(f"✅ {pkg['provider']} - {pkg['country']} - {pkg['plan_name']}: 入库成功 (${pkg['price']})")
                else:
                    logger.warning(f"⚠️  {pkg['country']}: HTTP {response.status_code}")
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
        print("🚀 GlobalPass - 通用爬虫系统启动 (Airalo + Nomad)")
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
            airalo_packages = self.scrape_airalo_country(country)
            if airalo_packages:
                self.upsert_to_supabase(airalo_packages)
            
            # 抓取 Nomad 数据
            nomad_packages = self.scrape_nomad_country(country)
            if nomad_packages:
                self.upsert_to_supabase(nomad_packages)
        
        # 输出统计
        print("\n" + "=" * 70)
        print("📊 爬虫执行统计")
        print("=" * 70)
        print(f"Airalo 套餐: {self.stats['airalo_scraped']}")
        print(f"Nomad 套餐: {self.stats['nomad_scraped']}")
        print(f"总计: {self.stats['airalo_scraped'] + self.stats['nomad_scraped']} 个套餐")
        print(f"Upsert 成功: {self.stats['upsert_success']}, 失败: {self.stats['upsert_error']}")
        print("=" * 70)
        
        return 0

def main():
    scraper = UniversalScraper()
    return scraper.run()

if __name__ == "__main__":
    import sys
    sys.exit(main())
