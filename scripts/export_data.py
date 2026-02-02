#!/usr/bin/env python3
"""
GlobalPass 数据导出脚本
从 Supabase 导出 E-SIM 套餐数据到静态 JSON 文件
用于前端静态加载
"""
import json
import requests
from pathlib import Path
from datetime import datetime
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Supabase 配置
SUPABASE_URL = "https://mzodnvjtlujvvwfnpcyb.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16b2Rudmp0bHVqdnZ3Zm5wY3liIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0MDk4NiwiZXhwIjoyMDgzMTE2OTg2fQ.gr-5J22EhV08PLghNcoS8o5lUFjaEyby21MwE-35ENs"

def export_packages():
    """从 Supabase 导出所有 E-SIM 套餐"""
    try:
        logger.info("📊 开始导出 E-SIM 套餐数据...")
        
        headers = {
            "apikey": SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
        }
        
        # 查询所有套餐
        url = f"{SUPABASE_URL}/rest/v1/esim_packages?select=*&order=country.asc,price.asc"
        
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            logger.error(f"❌ 查询失败: HTTP {response.status_code}")
            logger.error(f"   响应: {response.text[:200]}")
            return False
        
        packages = response.json()
        logger.info(f"✅ 获取 {len(packages)} 个套餐")
        
        # 按国家分组
        packages_by_country = {}
        for pkg in packages:
            country = pkg.get('country', 'Unknown')
            if country not in packages_by_country:
                packages_by_country[country] = []
            
            # 清理数据
            clean_pkg = {
                'id': pkg.get('id'),
                'country': pkg.get('country'),
                'provider': pkg.get('provider'),
                'plan_name': pkg.get('plan_name'),
                'data_type': pkg.get('data_type'),
                'data_amount': pkg.get('data_amount'),
                'validity': pkg.get('validity'),
                'price': pkg.get('price'),
                'network': pkg.get('network'),
                'link': pkg.get('link'),
                'last_checked': pkg.get('last_checked'),
                'raw_data': pkg.get('raw_data'),  # 包含 currency 等元数据
            }
            packages_by_country[country].append(clean_pkg)
        
        # 生成导出数据
        export_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'total_packages': len(packages),
            'countries': list(packages_by_country.keys()),
            'packages': packages_by_country,
            'all_packages': packages,  # 保留完整列表用于前端查询
        }
        
        # 写入 JSON 文件
        output_file = Path(__file__).parent.parent / "client" / "public" / "data" / "esim-packages.json"
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"✅ 数据导出成功: {output_file}")
        logger.info(f"   - 总套餐数: {len(packages)}")
        logger.info(f"   - 国家数: {len(packages_by_country)}")
        logger.info(f"   - 文件大小: {output_file.stat().st_size / 1024:.2f} KB")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ 导出失败: {str(e)}")
        return False

def export_countries():
    """导出国家列表"""
    try:
        logger.info("📍 导出国家列表...")
        
        headers = {
            "apikey": SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
        }
        
        # 查询所有国家
        url = f"{SUPABASE_URL}/rest/v1/esim_packages?select=country&order=country.asc"
        
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            logger.error(f"❌ 查询失败: HTTP {response.status_code}")
            return False
        
        data = response.json()
        countries = sorted(list(set([item['country'] for item in data])))
        
        # 写入国家列表
        output_file = Path(__file__).parent.parent / "client" / "public" / "data" / "countries.json"
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({
                'timestamp': datetime.utcnow().isoformat(),
                'countries': countries,
                'count': len(countries),
            }, f, ensure_ascii=False, indent=2)
        
        logger.info(f"✅ 国家列表导出成功: {len(countries)} 个国家")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ 导出失败: {str(e)}")
        return False

def main():
    print("\n" + "=" * 70)
    print("🚀 GlobalPass 数据导出系统启动")
    print("=" * 70)
    
    success = True
    success = export_packages() and success
    success = export_countries() and success
    
    print("\n" + "=" * 70)
    if success:
        print("✅ 所有数据导出成功")
    else:
        print("❌ 数据导出失败")
    print("=" * 70)
    
    return 0 if success else 1

if __name__ == "__main__":
    import sys
    sys.exit(main())
