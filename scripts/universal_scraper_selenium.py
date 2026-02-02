"""
GlobalPass - 混合爬虫系统（修复版）
功能：
- Airalo: Selenium + 旧数据兜底
- Nomad: BeautifulSoup（稳定可靠）
- 数据库写入修复
"""
import json
import requests
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import List, Dict
import re
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# 创建日志目录
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

# 配置日志
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

# Supabase 配置
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://mzodnvjtlujvvwfnpcyb.supabase.co")
SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

class UniversalScraper:
    """混合爬虫类"""
    
    def __init__(self):
        self.supabase_headers = {
            "apikey": SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
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
        self.old_airalo_data = {}
        self.driver = None
    
    def load_countries(self) -> List[Dict]:
        """加载国家配置"""
        config_file = Path(__file__).parent.parent / "config" / "countries.json"
        
        if not config_file.exists():
            logger.error(f"配置文件不存在: {config_file}")
            return []
        
        with open(config_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def load_old_airalo_data(self):
        """加载旧的 Airalo 数据作为兜底"""
        try:
            data_file = Path(__file__).parent.parent / "public" / "data" / "esim-packages.json"
            if data_file.exists():
                with open(data_file, 'r', encoding='utf-8') as f:
                    all_data = json.load(f)
                    # 数据文件结构: {"timestamp": ..., "all_packages": [...]}
                    packages = all_data.get("all_packages", [])
                    if not packages and isinstance(all_data, list):
                        # 兼容旧格式：直接是数组
                        packages = all_data
                    
                    # 遍历所有套餐，提取 Airalo 数据
                    for pkg in packages:
                        if isinstance(pkg, dict) and pkg.get("provider") == "Airalo":
                            country = pkg.get("country")
                            if country:
                                if country not in self.old_airalo_data:
                                    self.old_airalo_data[country] = []
                                self.old_airalo_data[country].append(pkg)
                    
                    total_packages = sum(len(pkgs) for pkgs in self.old_airalo_data.values())
                    logger.info(f"✅ 加载旧数据：{len(self.old_airalo_data)} 个国家，共 {total_packages} 个 Airalo 套餐")
        except Exception as e:
            logger.warning(f"⚠️ 无法加载旧数据: {e}")
    
    def init_selenium(self):
        """初始化 Selenium WebDriver"""
        if self.driver:
            return
        
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        
        self.driver = webdriver.Chrome(options=chrome_options)
    
    def close_selenium(self):
        """关闭 Selenium"""
        if self.driver:
            self.driver.quit()
            self.driver = None
    
    def scrape_airalo_country(self, country: Dict) -> List[Dict]:
        """使用 Selenium 抓取 Airalo（失败则使用旧数据）"""
        try:
            self.init_selenium()
            url = f"https://www.airalo.com/{country['airalo_slug']}-esim?currency=USD"
            
            logger.info(f"🌐 正在抓取 Airalo - {country['name']}...")
            
            self.driver.get(url)
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "button"))
            )
            
            buttons = self.driver.find_elements(By.TAG_NAME, "button")
            packages = []
            
            for btn in buttons:
                try:
                    hint = btn.get_attribute("hint") or btn.get_attribute("aria-label") or ""
                    if not hint or "USD" not in hint:
                        continue
                    
                    # 解析 hint: "Select 1 GB - 3 days for $4.00 USD."
                    match = re.search(r'(\d+)\s*GB.*?(\d+)\s*days.*?\$?([\d.]+)\s*USD', hint, re.IGNORECASE)
                    if match:
                        data_gb = match.group(1)
                        validity_days = match.group(2)
                        price = float(match.group(3))
                        
                        package = {
                            "provider": "Airalo",
                            "country": country['name'],
                            "plan_name": f"{country['name']} {data_gb}GB {validity_days} Days",
                            "data_type": "Data",
                            "data_amount": f"{data_gb}GB",
                            "validity": f"{validity_days} Days",
                            "price": price,
                            "network": "Local Operators",
                            "link": url,
                            "raw_data": json.dumps({"hint": hint}),
                            "last_checked": datetime.utcnow().isoformat(),
                        }
                        packages.append(package)
                except:
                    continue
            
            if packages:
                logger.info(f"✅ Airalo {country['name']}: 获取 {len(packages)} 个套餐")
                self.stats["airalo_scraped"] += len(packages)
                return packages
            else:
                raise Exception("未抓取到数据")
                
        except Exception as e:
            logger.warning(f"⚠️ Airalo {country['name']}: 未抓取到数据，尝试使用旧数据")
            old_packages = self.old_airalo_data.get(country['name'], [])
            if old_packages:
                logger.info(f"✅ 使用旧数据: {len(old_packages)} 个套餐")
                self.stats["airalo_scraped"] += len(old_packages)
                return old_packages
            return []
    
    def scrape_nomad_country(self, country: Dict) -> List[Dict]:
        """使用 BeautifulSoup 抓取 Nomad（稳定可靠）"""
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
            
            plan_items = soup.find_all('li')
            
            for item in plan_items:
                text = item.get_text(strip=True)
                
                if 'USD' not in text:
                    continue
                
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
                
                # 匹配价格
                price_match = re.search(r'USD\s*([\d.]+)', text_clean)
                if not price_match:
                    continue
                
                price = float(price_match.group(1))
                
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
                    "price": price,
                    "network": "Local Operators",
                    "link": url,
                    "raw_data": json.dumps({
                        "currency": "USD",
                        "original_price": price,
                        "data": data_str.strip(),
                        "validity": validity,
                    }),
                    "last_checked": datetime.utcnow().isoformat(),
                }
                packages.append(package)
            
            logger.info(f"✅ Nomad {country['name']}: 获取 {len(packages)} 个套餐")
            self.stats["nomad_scraped"] += len(packages)
            return packages
            
        except Exception as e:
            logger.error(f"❌ Nomad {country['name']} 错误: {str(e)}")
            return []
    
    def upsert_to_supabase(self, packages: List[Dict]) -> int:
        """Upsert 数据到 Supabase（使用 merge-duplicates 策略）"""
        if not packages:
            return 0
        
        success_count = 0
        
        for pkg in packages:
            try:
                url = f"{SUPABASE_URL}/rest/v1/esim_packages"
                
                # 使用 Prefer: resolution=merge-duplicates 实现 Upsert
                # 需要数据库有唯一键约束：(provider, country, plan_name)
                upsert_headers = {
                    **self.supabase_headers,
                    "Prefer": "resolution=merge-duplicates"
                }
                
                response = requests.post(
                    url,
                    headers=upsert_headers,
                    json=pkg,
                    timeout=10
                )
                
                if response.status_code in [200, 201]:
                    success_count += 1
                    self.stats["upsert_success"] += 1
                else:
                    logger.error(f"❌ {pkg['provider']} - {pkg['country']} - {pkg['plan_name']}: 入库失败 ({response.status_code})")
                    self.stats["upsert_error"] += 1
                    
            except Exception as e:
                logger.error(f"❌ {pkg['provider']} - {pkg['country']} - {pkg['plan_name']}: {str(e)[:100]}")
                self.stats["upsert_error"] += 1
        
        return success_count
    
    def run(self):
        """主运行流程"""
        logger.info("=" * 70)
        logger.info("🚀 GlobalPass 混合爬虫启动 (修复版)")
        logger.info("=" * 70)
        
        self.load_old_airalo_data()
        countries = self.load_countries()
        logger.info(f"📋 加载 {len(countries)} 个国家配置")
        
        for country in countries:
            logger.info("")
            logger.info("=" * 60)
            logger.info(f"🌍 处理国家: {country['name']}")
            logger.info("=" * 60)
            
            all_packages = []
            
            # Airalo (Selenium + 旧数据兜底)
            airalo_packages = self.scrape_airalo_country(country)
            all_packages.extend(airalo_packages)
            
            # Nomad (BeautifulSoup)
            nomad_packages = self.scrape_nomad_country(country)
            all_packages.extend(nomad_packages)
            
            # 入库
            if all_packages:
                self.upsert_to_supabase(all_packages)
        
        self.close_selenium()
        
        logger.info("")
        logger.info("📊 爬虫统计")
        logger.info("=" * 70)
        logger.info(f"Airalo 套餐: {self.stats['airalo_scraped']}")
        logger.info(f"Nomad 套餐: {self.stats['nomad_scraped']}")
        logger.info(f"总计: {self.stats['airalo_scraped'] + self.stats['nomad_scraped']} 个套餐")
        logger.info(f"Upsert 成功: {self.stats['upsert_success']}, 失败: {self.stats['upsert_error']}")

if __name__ == "__main__":
    scraper = UniversalScraper()
    scraper.run()
