#!/usr/bin/env python3
"""
GlobalPass - 通用爬虫核心系统
阶段二：自动化供货系统

功能：
- 多源抓取（Airalo、Nomad）
- 货币锁定（USD）
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

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Supabase 配置
SUPABASE_URL = "https://mzodnvjtlujvvwfnpcyb.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16b2Rudmp0bHVqdnZ3Zm5wY3liIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0MDk4NiwiZXhwIjoyMDgzMTE2OTg2fQ.gr-5J22EhV08PLghNcoS8o5lUFjaEyby21MwE-35ENs"

# HTTP 请求头
AIRALO_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
    "Cookie": "currency=USD",
}

NOMAD_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
}


class UniversalScraper:
    """通用爬虫类"""
    
    def __init__(self):
        self.supabase_headers = {
            "apikey": SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
        }
        self.packages = []
        self.stats = {
            "airalo_success": 0,
            "airalo_error": 0,
            "nomad_success": 0,
            "nomad_error": 0,
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
    
    def clean_validity(self, validity_str: str) -> str:
        """清洗有效期格式"""
        if not validity_str:
            return "7 Days"
        
        # 提取数字和单位
        match = re.search(r'(\d+)\s*(day|days|hour|hours|month|months)', validity_str.lower())
        if match:
            num = match.group(1)
            unit = match.group(2).lower()
            
            if 'day' in unit:
                return f"{num} Days"
            elif 'month' in unit:
                return f"{num} Months"
            elif 'hour' in unit:
                return f"{num} Hours"
        
        return "7 Days"
    
    def detect_unlimited(self, data_str: str) -> bool:
        """检测是否为无限流量"""
        if not data_str:
            return False
        return 'unlimited' in data_str.lower()
    
    def scrape_airalo(self, country: Dict) -> List[Dict]:
        """从 Airalo 抓取数据"""
        try:
            url = f"https://www.airalo.com/api/v2/packages?country_code={country['airalo_slug']}"
            
            logger.info(f"🌐 正在抓取 Airalo - {country['name']}...")
            
            response = requests.get(
                url,
                headers=AIRALO_HEADERS,
                timeout=10
            )
            
            if response.status_code != 200:
                logger.warning(f"❌ Airalo {country['name']}: HTTP {response.status_code}")
                self.stats["airalo_error"] += 1
                return []
            
            data = response.json()
            packages = []
            
            # 解析 Airalo 数据格式（示例）
            if 'packages' in data:
                for pkg in data['packages']:
                    is_unlimited = self.detect_unlimited(pkg.get('data', ''))
                    
                    package = {
                        "provider": "Airalo",
                        "country": country['name'],
                        "plan_name": pkg.get('name', ''),
                        "data_type": "Unlimited" if is_unlimited else "Fixed",
                        "data_amount": "Unlimited" if is_unlimited else pkg.get('data', ''),
                        "validity": self.clean_validity(pkg.get('validity', '')),
                        "price": float(pkg.get('price', 0)),
                        "network": pkg.get('network', ''),
                        "link": f"https://www.airalo.com/{country['airalo_slug']}-esim",
                        "raw_data": json.dumps(pkg),
                        "last_checked": datetime.utcnow().isoformat(),
                    }
                    packages.append(package)
            
            logger.info(f"✅ Airalo {country['name']}: 获取 {len(packages)} 个套餐")
            self.stats["airalo_success"] += 1
            return packages
            
        except Exception as e:
            logger.error(f"❌ Airalo {country['name']} 错误: {str(e)[:100]}")
            self.stats["airalo_error"] += 1
            return []
    
    def scrape_nomad(self, country: Dict) -> List[Dict]:
        """从 Nomad (GetNomad.app) 抓取数据"""
        try:
            url = f"https://getnomad.app/api/packages?country={country['nomad_slug']}"
            
            logger.info(f"🌐 正在抓取 Nomad - {country['name']}...")
            
            response = requests.get(
                url,
                headers=NOMAD_HEADERS,
                timeout=10
            )
            
            if response.status_code != 200:
                logger.warning(f"❌ Nomad {country['name']}: HTTP {response.status_code}")
                self.stats["nomad_error"] += 1
                return []
            
            data = response.json()
            packages = []
            
            # 解析 Nomad 数据格式（示例）
            if 'data' in data:
                for pkg in data['data']:
                    is_unlimited = self.detect_unlimited(pkg.get('data', ''))
                    
                    package = {
                        "provider": "Nomad",
                        "country": country['name'],
                        "plan_name": pkg.get('title', ''),
                        "data_type": "Unlimited" if is_unlimited else "Fixed",
                        "data_amount": "Unlimited" if is_unlimited else pkg.get('data', ''),
                        "validity": self.clean_validity(pkg.get('validity', '')),
                        "price": float(pkg.get('price_usd', 0)),
                        "network": pkg.get('operator', ''),
                        "link": pkg.get('purchase_link', f"https://getnomad.app/{country['nomad_slug']}"),
                        "raw_data": json.dumps(pkg),
                        "last_checked": datetime.utcnow().isoformat(),
                    }
                    packages.append(package)
            
            logger.info(f"✅ Nomad {country['name']}: 获取 {len(packages)} 个套餐")
            self.stats["nomad_success"] += 1
            return packages
            
        except Exception as e:
            logger.error(f"❌ Nomad {country['name']} 错误: {str(e)[:100]}")
            self.stats["nomad_error"] += 1
            return []
    
    def upsert_to_supabase(self, packages: List[Dict]) -> int:
        """Upsert 数据到 Supabase"""
        if not packages:
            return 0
        
        success_count = 0
        
        for pkg in packages:
            try:
                # 构建 Upsert 查询
                # 根据 provider + country + plan_name 进行 Upsert
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
                    logger.info(f"✅ {pkg['provider']} - {pkg['country']} - {pkg['plan_name']}: 入库成功")
                else:
                    logger.warning(f"⚠️  {pkg['provider']} - {pkg['country']}: {response.status_code}")
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
        print("🚀 GlobalPass - 通用爬虫系统启动")
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
            
            # 抓取 Airalo
            airalo_packages = self.scrape_airalo(country)
            if airalo_packages:
                self.upsert_to_supabase(airalo_packages)
            
            # 抓取 Nomad
            nomad_packages = self.scrape_nomad(country)
            if nomad_packages:
                self.upsert_to_supabase(nomad_packages)
        
        # 输出统计
        print("\n" + "=" * 70)
        print("📊 爬虫执行统计")
        print("=" * 70)
        print(f"Airalo 成功: {self.stats['airalo_success']}, 失败: {self.stats['airalo_error']}")
        print(f"Nomad 成功: {self.stats['nomad_success']}, 失败: {self.stats['nomad_error']}")
        print(f"Upsert 成功: {self.stats['upsert_success']}, 失败: {self.stats['upsert_error']}")
        print("=" * 70)
        
        return 0


def main():
    scraper = UniversalScraper()
    return scraper.run()


if __name__ == "__main__":
    import sys
    sys.exit(main())
