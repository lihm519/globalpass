#!/usr/bin/env python3
"""
GlobalPass - 通用爬虫核心系统（Playwright 版本）
修复：Airalo 网站改版后使用 JavaScript 渲染，需要使用浏览器自动化
功能：
- 从 Airalo 官网网页抓取真实数据（使用 Playwright）
- 从 Nomad 官网网页抓取真实数据（使用 requests）
- 货币转换（EUR → USD）
- 无限流量识别
- 有效期清洗
- Upsert 入库
"""
import json
import requests
import logging
import os
import re
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

# 创建日志目录
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

# 配置日志（同时输出到文件和控制台）
log_file = log_dir / f"scraper_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Supabase 配置（优先使用环境变量）
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://mzodnvjtlujvvwfnpcyb.supabase.co")
SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16b2Rudmp0bHVqdnZ3Zm5wY3liIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0MDk4NiwiZXhwIjoyMDgzMTE2OTg2fQ.gr-5J22EhV08PLghNcoS8o5lUFjaEyby21MwE-35ENs")

class UniversalScraper:
    """通用爬虫类 - 支持 Airalo (Playwright) 和 Nomad (requests)"""
    
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
    
    def scrape_airalo_country(self, country: Dict) -> List[Dict]:
        """从 Airalo 官网抓取单个国家的数据（使用 Playwright）"""
        try:
            url = f"https://www.airalo.com/{country['airalo_slug']}-esim"
            
            logger.info(f"🌐 正在抓取 Airalo - {country['name']}...")
            
            with sync_playwright() as p:
                # 启动浏览器（无头模式）
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                
                # 访问页面
                page.goto(url, wait_until="networkidle", timeout=30000)
                
                # 等待页面加载完成（等待任意按钮出现）
                try:
                    page.wait_for_selector('button', timeout=10000)
                except PlaywrightTimeoutError:
                    logger.warning(f"⚠️ Airalo {country['name']}: 页面加载超时")
                    browser.close()
                    return []
                
                # 获取所有按钮元素
                buttons = page.query_selector_all('button')
                
                packages = []
                for button in buttons:
                    # 尝试获取 aria-label 属性（可能是 hint 或 aria-label）
                    aria_label = button.get_attribute('aria-label') or button.get_attribute('hint') or ''
                    
                    # 解析 aria-label: "Select 1 GB - 3 days for $4.00 USD."
                    match = re.match(r'Select\s+(\d+)\s*GB\s*-\s*(\d+)\s*days?\s+for\s+\$?([\d.]+)\s*USD', aria_label, re.IGNORECASE)
                    
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
                self.stats["airalo_scraped"] += len(packages)
                return packages
                
        except Exception as e:
            logger.error(f"❌ Airalo {country['name']} 错误: {str(e)[:200]}")
            return []
    
    def scrape_nomad_country(self, country: Dict) -> List[Dict]:
        """从 Nomad 官网抓取单个国家的数据"""
        try:
            url = f"https://www.getnomad.app/api/v1/packages?country_slug={country['nomad_slug']}"
            
            logger.info(f"🌐 正在抓取 Nomad - {country['name']}...")
            
            response = self.session.get(url, timeout=15)
            
            if response.status_code != 200:
                logger.warning(f"❌ Nomad {country['name']}: HTTP {response.status_code}")
                return []
            
            data = response.json()
            packages = []
            
            if not data.get("data"):
                logger.warning(f"⚠️ Nomad {country['name']}: 无数据")
                return []
            
            for item in data["data"]:
                # 解析数据量
                data_amount = item.get("data", "Unknown")
                if data_amount == "unlimited":
                    data_type = "Unlimited"
                    data_amount_str = "Unlimited"
                else:
                    data_type = "Data"
                    data_amount_str = f"{data_amount}GB"
                
                # 解析有效期
                validity_days = item.get("validity", 0)
                validity = f"{validity_days} Day" if validity_days == 1 else f"{validity_days} Days"
                
                # 价格（Nomad 使用 USD）
                price = float(item.get("price", 0))
                
                # 套餐名称
                plan_name = f"{country['name']} {data_amount_str} {validity}"
                
                package = {
                    "provider": "Nomad",
                    "country": country['name'],
                    "plan_name": plan_name,
                    "data_type": data_type,
                    "data_amount": data_amount_str,
                    "validity": validity,
                    "price": price,
                    "network": "Local Operators",
                    "link": f"https://www.getnomad.app/shop/{country['nomad_slug']}",
                    "raw_data": json.dumps({
                        "original_price": price,
                        "currency": "USD",
                        "data": data_amount,
                        "validity": validity,
                    }),
                    "last_checked": datetime.utcnow().isoformat(),
                }
                packages.append(package)
                logger.debug(f"   ✅ {data_amount_str} {validity} - ${price}")
            
            logger.info(f"✅ Nomad {country['name']}: 获取 {len(packages)} 个套餐")
            self.stats["nomad_scraped"] += len(packages)
            return packages
            
        except Exception as e:
            logger.error(f"❌ Nomad {country['name']} 错误: {str(e)[:100]}")
            return []
    
    def upsert_package(self, package: Dict) -> bool:
        """Upsert 单个套餐到 Supabase"""
        try:
            url = f"{SUPABASE_URL}/rest/v1/esim_packages"
            
            # 使用 provider + country + plan_name 作为唯一标识
            params = {
                "provider": f"eq.{package['provider']}",
                "country": f"eq.{package['country']}",
                "plan_name": f"eq.{package['plan_name']}",
            }
            
            # 先查询是否存在
            response = self.session.get(url, headers=self.supabase_headers, params=params)
            
            if response.status_code == 200 and response.json():
                # 存在，执行更新
                existing_id = response.json()[0]['id']
                update_url = f"{url}?id=eq.{existing_id}"
                response = self.session.patch(update_url, headers=self.supabase_headers, json=package)
            else:
                # 不存在，执行插入
                response = self.session.post(url, headers=self.supabase_headers, json=package)
            
            if response.status_code in [200, 201]:
                logger.info(f"✅ {package['provider']} - {package['country']} - {package['plan_name']}: 入库成功 (${package['price']})")
                self.stats["upsert_success"] += 1
                return True
            else:
                logger.error(f"❌ {package['provider']} - {package['country']} - {package['plan_name']}: 入库失败 ({response.status_code})")
                self.stats["upsert_error"] += 1
                return False
                
        except Exception as e:
            logger.error(f"❌ Upsert 错误: {str(e)[:100]}")
            self.stats["upsert_error"] += 1
            return False
    
    def run(self):
        """运行爬虫"""
        logger.info("=" * 70)
        logger.info("🚀 GlobalPass 通用爬虫启动 (Playwright 版本)")
        logger.info("=" * 70)
        
        countries = self.load_countries()
        
        if not countries:
            logger.error("❌ 无法加载国家配置，退出")
            return
        
        logger.info(f"📋 加载 {len(countries)} 个国家配置")
        
        for country in countries:
            logger.info("")
            logger.info("=" * 60)
            logger.info(f"🌍 处理国家: {country['name']}")
            logger.info("=" * 60)
            
            # 抓取 Airalo
            airalo_packages = self.scrape_airalo_country(country)
            
            # 抓取 Nomad
            nomad_packages = self.scrape_nomad_country(country)
            
            # 合并所有套餐
            all_packages = airalo_packages + nomad_packages
            
            # Upsert 到数据库
            for package in all_packages:
                self.upsert_package(package)
        
        # 打印统计
        logger.info("")
        logger.info("=" * 70)
        logger.info("📊 爬虫统计")
        logger.info("=" * 70)
        logger.info(f"Airalo 套餐: {self.stats['airalo_scraped']}")
        logger.info(f"Nomad 套餐: {self.stats['nomad_scraped']}")
        logger.info(f"总计: {self.stats['airalo_scraped'] + self.stats['nomad_scraped']} 个套餐")
        logger.info(f"Upsert 成功: {self.stats['upsert_success']}, 失败: {self.stats['upsert_error']}")
        logger.info("=" * 70)

if __name__ == "__main__":
    scraper = UniversalScraper()
    scraper.run()
