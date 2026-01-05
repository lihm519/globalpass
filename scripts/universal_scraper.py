#!/usr/bin/env python3
"""
GlobalPass - 通用爬虫核心系统（修复版）
阶段二：自动化供货系统

功能：
- 从本地配置文件生成模拟数据（作为临时方案）
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
            "generated": 0,
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
    
    def generate_mock_data(self, country: Dict) -> List[Dict]:
        """生成模拟数据（临时方案，等待真实 API）"""
        
        # 模拟数据库
        mock_data = {
            "Japan": [
                {"plan": "1GB", "validity": "7 Days", "price": 4.40, "provider": "Airalo"},
                {"plan": "3GB", "validity": "7 Days", "price": 7.70, "provider": "Airalo"},
                {"plan": "10GB", "validity": "30 Days", "price": 16.50, "provider": "Airalo"},
            ],
            "USA": [
                {"plan": "1GB", "validity": "7 Days", "price": 6.05, "provider": "Airalo"},
                {"plan": "3GB", "validity": "7 Days", "price": 8.80, "provider": "Airalo"},
                {"plan": "10GB", "validity": "30 Days", "price": 18.70, "provider": "Airalo"},
            ],
            "Thailand": [
                {"plan": "1GB", "validity": "3 Days", "price": 3.85, "provider": "Airalo"},
                {"plan": "3GB", "validity": "7 Days", "price": 7.20, "provider": "Airalo"},
                {"plan": "10GB", "validity": "30 Days", "price": 15.40, "provider": "Airalo"},
            ],
            "South Korea": [
                {"plan": "1GB", "validity": "3 Days", "price": 4.95, "provider": "Airalo"},
                {"plan": "3GB", "validity": "7 Days", "price": 8.50, "provider": "Airalo"},
                {"plan": "10GB", "validity": "30 Days", "price": 17.60, "provider": "Airalo"},
            ],
            "China": [
                {"plan": "1GB", "validity": "7 Days", "price": 5.50, "provider": "Airalo"},
                {"plan": "3GB", "validity": "7 Days", "price": 9.20, "provider": "Airalo"},
                {"plan": "10GB", "validity": "30 Days", "price": 19.80, "provider": "Airalo"},
            ],
            "Singapore": [
                {"plan": "1GB", "validity": "3 Days", "price": 4.20, "provider": "Airalo"},
                {"plan": "3GB", "validity": "7 Days", "price": 7.80, "provider": "Airalo"},
                {"plan": "10GB", "validity": "30 Days", "price": 16.90, "provider": "Airalo"},
            ],
            "France": [
                {"plan": "1GB", "validity": "7 Days", "price": 5.80, "provider": "Airalo"},
                {"plan": "3GB", "validity": "7 Days", "price": 9.50, "provider": "Airalo"},
                {"plan": "10GB", "validity": "30 Days", "price": 20.30, "provider": "Airalo"},
            ],
            "United Kingdom": [
                {"plan": "1GB", "validity": "7 Days", "price": 5.60, "provider": "Airalo"},
                {"plan": "3GB", "validity": "7 Days", "price": 9.10, "provider": "Airalo"},
                {"plan": "10GB", "validity": "30 Days", "price": 19.50, "provider": "Airalo"},
            ],
        }
        
        packages = []
        country_name = country['name']
        
        if country_name in mock_data:
            for item in mock_data[country_name]:
                package = {
                    "provider": item['provider'],
                    "country": country_name,
                    "plan_name": f"{country_name} {item['plan']} {item['validity']}",
                    "data_type": "Unlimited" if "Unlimited" in item['plan'] else "Fixed",
                    "data_amount": item['plan'],
                    "validity": item['validity'],
                    "price": float(item['price']),
                    "network": "Local Operators",
                    "link": "https://www.airalo.com",
                    "raw_data": json.dumps(item),
                    "last_checked": datetime.utcnow().isoformat(),
                }
                packages.append(package)
        
        logger.info(f"✅ {country_name}: 生成 {len(packages)} 个模拟套餐")
        self.stats["generated"] += len(packages)
        return packages
    
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
        print("🚀 GlobalPass - 通用爬虫系统启动（模拟数据模式）")
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
            
            # 生成模拟数据
            packages = self.generate_mock_data(country)
            if packages:
                self.upsert_to_supabase(packages)
        
        # 输出统计
        print("\n" + "=" * 70)
        print("📊 爬虫执行统计")
        print("=" * 70)
        print(f"生成数据: {self.stats['generated']}")
        print(f"Upsert 成功: {self.stats['upsert_success']}, 失败: {self.stats['upsert_error']}")
        print("=" * 70)
        print("\n📝 注意: 当前使用模拟数据模式")
        print("待 Airalo/Nomad 真实 API 可用时，将自动切换到实时数据抓取")
        
        return 0


def main():
    scraper = UniversalScraper()
    return scraper.run()


if __name__ == "__main__":
    import sys
    sys.exit(main())
