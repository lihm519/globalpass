"""
GlobalPass - Selenium 爬虫（精确抓取官网美元价格）
功能：
- 使用 Selenium 自动化浏览器
- 直接抓取 Airalo 和 Nomad 官网显示的美元价格
- 准确识别套餐有效期
- 只抓取实际存在的套餐
"""
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict
import time
import re

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Supabase 配置
SUPABASE_URL = "https://mzodnvjtlujvvwfnpcyb.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16b2Rudmp0bHVqdnZ3Zm5wY3liIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0MDk4NiwiZXhwIjoyMDgzMTE2OTg2fQ.gr-5J22EhV08PLghNcoS8o5lUFjaEyby21MwE-35ENs"

class SeleniumScraper:
    """Selenium 爬虫类 - 精确抓取官网价格"""
    
    def __init__(self):
        self.driver = None
        self.stats = {
            "airalo_scraped": 0,
            "nomad_scraped": 0,
            "upsert_success": 0,
            "upsert_error": 0,
        }
    
    def init_driver(self):
        """初始化 Chrome 浏览器"""
        chrome_options = Options()
        chrome_options.add_argument('--headless')  # 无头模式
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        
        self.driver = webdriver.Chrome(options=chrome_options)
        logger.info("✅ Chrome 浏览器初始化成功")
    
    def close_driver(self):
        """关闭浏览器"""
        if self.driver:
            self.driver.quit()
            logger.info("🔒 Chrome 浏览器已关闭")
    
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
            logger.info(f"   URL: {url}")
            
            self.driver.get(url)
            
            # 等待页面加载
            time.sleep(3)
            
            packages = []
            
            # 查找所有套餐链接（包含 "GB" 和 "USD" 的链接）
            try:
                # 等待页面完全加载
                WebDriverWait(self.driver, 15).until(
                    EC.presence_of_element_located((By.TAG_NAME, "a"))
                )
                
                # 额外等待 JavaScript 渲染
                time.sleep(3)
                
                # 获取页面 HTML
                page_source = self.driver.page_source
                
                # 使用正则表达式从 HTML 中提取 hint 属性
                # 格式: hint="Select 1 GB - 3 Days for $4.00 USD."
                hint_pattern = r'hint="Select (\d+) GB - (\d+) Days? for \$([\d.]+) USD\.?"'
                matches = re.findall(hint_pattern, page_source)
                
                for match in matches:
                    data_amount = match[0]
                    validity = match[1]
                    price = float(match[2])
                    
                    package = {
                        "provider": "Airalo",
                        "country": country['name'],
                        "plan_name": f"{country['name']} {data_amount}GB {validity} Days",
                        "data_type": "Data",
                        "data_amount": f"{data_amount}GB",
                        "validity": f"{validity} Days",
                        "price": price,
                        "network": "Local Operators",
                        "link": url,
                        "raw_data": json.dumps({
                            "original_price": price,
                            "currency": "USD",
                            "data": f"{data_amount}GB",
                            "validity": f"{validity} Days",
                        }),
                        "last_checked": datetime.utcnow().isoformat(),
                    }
                    packages.append(package)
                    logger.debug(f"   ✅ {data_amount}GB {validity} Days: ${price}")
                
                # 解析 Unlimited 套餐
                unlimited_pattern = r'hint="Select Unlimited - (\d+) Days? for \$([\d.]+) USD\.?"'
                unlimited_matches = re.findall(unlimited_pattern, page_source)
                
                for match in unlimited_matches:
                    validity = match[0]
                    price = float(match[1])
                    
                    package = {
                        "provider": "Airalo",
                        "country": country['name'],
                        "plan_name": f"{country['name']} Unlimited {validity} Days",
                        "data_type": "Unlimited",
                        "data_amount": "Unlimited",
                        "validity": f"{validity} Days",
                        "price": price,
                        "network": "Local Operators",
                        "link": url,
                        "raw_data": json.dumps({
                            "original_price": price,
                            "currency": "USD",
                            "data": "Unlimited",
                            "validity": f"{validity} Days",
                        }),
                        "last_checked": datetime.utcnow().isoformat(),
                    }
                    packages.append(package)
                    logger.debug(f"   ✅ Unlimited {validity} Days: ${price}")
                
                logger.info(f"✅ Airalo {country['name']}: 获取 {len(packages)} 个套餐")
                self.stats["airalo_scraped"] += len(packages)
                return packages
            
            except Exception as e:
                logger.error(f"❌ Airalo {country['name']}: 解析失败 - {e}")
                return []
        
        except Exception as e:
            logger.error(f"❌ Airalo {country['name']}: 抓取失败 - {e}")
            return []
    
    def scrape_nomad_country(self, country: Dict) -> List[Dict]:
        """从 Nomad 官网抓取单个国家的数据"""
        try:
            url = f"https://www.getnomad.app/shop?country={country['nomad_code']}"
            
            logger.info(f"🌐 正在抓取 Nomad - {country['name']}...")
            logger.info(f"   URL: {url}")
            
            self.driver.get(url)
            
            # 等待页面加载
            time.sleep(3)
            
            packages = []
            
            # Nomad 的套餐信息通常在特定的 div 或 card 中
            # 需要根据实际页面结构调整选择器
            try:
                # 查找所有包含价格的元素
                page_text = self.driver.find_element(By.TAG_NAME, "body").text
                
                # 解析套餐信息（示例正则，需根据实际页面调整）
                # 格式示例: "1 GB For 7 DAYS USD4.00"
                matches = re.findall(r'(\d+)\s*GB\s*For\s*(\d+)\s*DAYS\s*USD\s*([\d.]+)', page_text, re.IGNORECASE)
                
                for match in matches:
                    data_amount = match[0]
                    validity = match[1]
                    price = float(match[2])
                    
                    package = {
                        "provider": "Nomad",
                        "country": country['name'],
                        "plan_name": f"{country['name']} {data_amount} GB {validity} Days",
                        "data_type": "Data",
                        "data_amount": f"{data_amount}GB",
                        "validity": f"{validity} Days",
                        "price": price,
                        "network": "Local Operators",
                        "link": url,
                        "raw_data": json.dumps({
                            "original_price": price,
                            "currency": "USD",
                            "data": f"{data_amount}GB",
                            "validity": f"{validity} Days",
                        }),
                        "last_checked": datetime.utcnow().isoformat(),
                    }
                    packages.append(package)
                    logger.debug(f"   ✅ {data_amount}GB {validity} Days: ${price}")
                
                # 解析 Unlimited 套餐
                unlimited_matches = re.findall(r'Unlimited\s*For\s*(\d+)\s*DAYS\s*USD\s*([\d.]+)', page_text, re.IGNORECASE)
                
                for match in unlimited_matches:
                    validity = match[0]
                    price = float(match[1])
                    
                    package = {
                        "provider": "Nomad",
                        "country": country['name'],
                        "plan_name": f"{country['name']} Unlimited {validity} Days",
                        "data_type": "Unlimited",
                        "data_amount": "Unlimited",
                        "validity": f"{validity} Days",
                        "price": price,
                        "network": "Local Operators",
                        "link": url,
                        "raw_data": json.dumps({
                            "original_price": price,
                            "currency": "USD",
                            "data": "Unlimited",
                            "validity": f"{validity} Days",
                        }),
                        "last_checked": datetime.utcnow().isoformat(),
                    }
                    packages.append(package)
                    logger.debug(f"   ✅ Unlimited {validity} Days: ${price}")
                
                logger.info(f"✅ Nomad {country['name']}: 获取 {len(packages)} 个套餐")
                self.stats["nomad_scraped"] += len(packages)
                return packages
            
            except Exception as e:
                logger.error(f"❌ Nomad {country['name']}: 解析失败 - {e}")
                return []
        
        except Exception as e:
            logger.error(f"❌ Nomad {country['name']}: 抓取失败 - {e}")
            return []
    
    def upsert_package(self, package: Dict) -> bool:
        """Upsert 套餐到数据库"""
        import requests
        
        try:
            url = f"{SUPABASE_URL}/rest/v1/esim_packages"
            headers = {
                "apikey": SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "resolution=merge-duplicates",
            }
            
            response = requests.post(url, headers=headers, json=package, timeout=10)
            
            if response.status_code in [200, 201, 204]:
                self.stats["upsert_success"] += 1
                return True
            else:
                logger.warning(f"⚠️  Upsert 失败: {package['plan_name']} - {response.status_code}")
                self.stats["upsert_error"] += 1
                return False
        
        except Exception as e:
            logger.error(f"❌ Upsert 错误: {package['plan_name']} - {e}")
            self.stats["upsert_error"] += 1
            return False
    
    def run(self):
        """运行爬虫"""
        try:
            logger.info("="*60)
            logger.info("🚀 GlobalPass Selenium 爬虫启动")
            logger.info("="*60)
            
            # 初始化浏览器
            self.init_driver()
            
            # 加载国家配置
            countries = self.load_countries()
            
            if not countries:
                logger.error("❌ 无法加载国家配置")
                return
            
            logger.info(f"📋 加载了 {len(countries)} 个国家配置")
            
            all_packages = []
            
            # 只抓取日本进行测试
            test_countries = [c for c in countries if c['name'] == 'Japan']
            
            for country in test_countries:
                logger.info("="*60)
                logger.info(f"🌍 处理国家: {country['name']}")
                logger.info("="*60)
                
                # 抓取 Airalo
                airalo_packages = self.scrape_airalo_country(country)
                all_packages.extend(airalo_packages)
                
                # 抓取 Nomad
                nomad_packages = self.scrape_nomad_country(country)
                all_packages.extend(nomad_packages)
                
                time.sleep(2)  # 避免请求过快
            
            # 更新数据库
            logger.info("")
            logger.info("="*60)
            logger.info("📤 正在更新数据库...")
            logger.info("="*60)
            
            for package in all_packages:
                self.upsert_package(package)
            
            # 打印统计报告
            logger.info("")
            logger.info("="*60)
            logger.info("📊 爬虫统计报告")
            logger.info("="*60)
            logger.info(f"✅ Airalo 抓取: {self.stats['airalo_scraped']} 个套餐")
            logger.info(f"✅ Nomad 抓取: {self.stats['nomad_scraped']} 个套餐")
            logger.info(f"✅ 数据库更新成功: {self.stats['upsert_success']} 条")
            logger.info(f"❌ 数据库更新失败: {self.stats['upsert_error']} 条")
            logger.info("="*60)
        
        finally:
            self.close_driver()

if __name__ == "__main__":
    scraper = SeleniumScraper()
    scraper.run()
