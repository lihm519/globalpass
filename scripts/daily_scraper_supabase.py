#!/usr/bin/env python3
"""
Daily E-SIM Scraper - Supabase Version
每日定时抓取 Airalo 和 Nomad 的 eSIM 套餐数据并写入 Supabase
"""

import os
import sys
import logging
from datetime import datetime
from supabase import create_client, Client

# 添加 scripts 目录到路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from airalo_final import scrape_airalo_country
from nomad_scraper import scrape_nomad_country

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 目标国家列表
COUNTRIES = [
    {"name": "Japan", "airalo_slug": "japan", "nomad_slug": "japan"},
    {"name": "USA", "airalo_slug": "usa", "nomad_slug": "united-states"},
    {"name": "Thailand", "airalo_slug": "thailand", "nomad_slug": "thailand"},
    {"name": "Singapore", "airalo_slug": "singapore", "nomad_slug": "singapore"},
    {"name": "Australia", "airalo_slug": "australia", "nomad_slug": "australia"},
    {"name": "United Kingdom", "airalo_slug": "united-kingdom", "nomad_slug": "united-kingdom"},
    {"name": "France", "airalo_slug": "france", "nomad_slug": "france"},
    {"name": "Germany", "airalo_slug": "germany", "nomad_slug": "germany"},
    {"name": "Italy", "airalo_slug": "italy", "nomad_slug": "italy"},
    {"name": "Spain", "airalo_slug": "spain", "nomad_slug": "spain"},
]

def init_supabase() -> Client:
    """初始化 Supabase 客户端"""
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY')
    
    if not supabase_url or not supabase_key:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY environment variables are required")
    
    logger.info(f"连接到 Supabase: {supabase_url}")
    return create_client(supabase_url, supabase_key)

def insert_packages(supabase: Client, packages: list) -> int:
    """批量插入套餐数据到 Supabase"""
    if not packages:
        return 0
    
    # 转换字段名为驼峰命名（匹配数据库 schema）
    supabase_packages = []
    for pkg in packages:
        supabase_pkg = {
            "provider": pkg["provider"],
            "country": pkg["country"],
            "planName": pkg["plan_name"],
            "dataType": pkg["data_type"],
            "dataAmount": pkg["data_amount"],
            "validity": pkg["validity"],
            "price": str(pkg["price"]),
            "network": pkg["network"],
            "link": pkg["link"],
            "rawData": pkg["raw_data"],
            "lastChecked": pkg["last_checked"],
        }
        supabase_packages.append(supabase_pkg)
    
    # 批量插入
    try:
        response = supabase.table("esim_packages").insert(supabase_packages).execute()
        logger.info(f"✅ 成功插入 {len(supabase_packages)} 条数据")
        return len(supabase_packages)
    except Exception as e:
        logger.error(f"❌ 插入数据失败: {e}")
        return 0

def main():
    """主函数"""
    logger.info("=" * 60)
    logger.info("Daily E-SIM Scraper - Supabase Version")
    logger.info(f"开始时间: {datetime.now().isoformat()}")
    logger.info("=" * 60)
    
    # 初始化 Supabase
    try:
        supabase = init_supabase()
    except ValueError as e:
        logger.error(f"❌ {e}")
        sys.exit(1)
    
    total_packages = 0
    
    # 遍历所有国家
    for country in COUNTRIES:
        logger.info(f"\n{'='*60}")
        logger.info(f"抓取 {country['name']} 数据...")
        logger.info(f"{'='*60}")
        
        # 抓取 Airalo 数据
        try:
            airalo_packages = scrape_airalo_country(country["name"], country["airalo_slug"])
            if airalo_packages:
                inserted = insert_packages(supabase, airalo_packages)
                total_packages += inserted
        except Exception as e:
            logger.error(f"❌ Airalo {country['name']} 抓取失败: {e}")
        
        # 抓取 Nomad 数据
        try:
            nomad_packages = scrape_nomad_country(country["name"], country["nomad_slug"])
            if nomad_packages:
                inserted = insert_packages(supabase, nomad_packages)
                total_packages += inserted
        except Exception as e:
            logger.error(f"❌ Nomad {country['name']} 抓取失败: {e}")
    
    logger.info(f"\n{'='*60}")
    logger.info(f"✅ 抓取完成！总共插入 {total_packages} 条数据")
    logger.info(f"结束时间: {datetime.now().isoformat()}")
    logger.info(f"{'='*60}")

if __name__ == "__main__":
    main()
