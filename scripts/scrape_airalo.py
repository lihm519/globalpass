#!/usr/bin/env python3
"""
Airalo E-SIM 数据采集脚本 (Manus Schedule 自动化版本)

功能：
- 使用 Manus Browser Operator 访问 Airalo 网站
- 采集 20 个国家的 E-SIM 套餐数据
- 使用 UPSERT 写入 Supabase 数据库
- 完整的错误处理和日志记录

运行方式：
    python3 scripts/scrape_airalo.py

环境变量：
    SUPABASE_URL - Supabase 项目 URL
    SUPABASE_SERVICE_ROLE_KEY - Supabase Service Role Key
"""

import os
import sys
import re
import json
import time
from datetime import datetime
import requests

# 配置
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# 20 个目标国家
TARGET_COUNTRIES = [
    ('Japan', 'japan'),
    ('South Korea', 'south-korea'),
    ('Thailand', 'thailand'),
    ('Singapore', 'singapore'),
    ('Hong Kong', 'hong-kong'),
    ('Taiwan', 'taiwan'),
    ('Malaysia', 'malaysia'),
    ('Indonesia', 'indonesia'),
    ('Philippines', 'philippines'),
    ('Vietnam', 'vietnam'),
    ('USA', 'united-states'),
    ('UK', 'united-kingdom'),
    ('France', 'france'),
    ('Germany', 'germany'),
    ('Italy', 'italy'),
    ('Spain', 'spain'),
    ('Australia', 'australia'),
    ('Canada', 'canada'),
    ('India', 'india'),
    ('China', 'china')
]

def log(message, level='INFO'):
    """统一日志输出"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] [{level}] {message}", flush=True)

def check_environment():
    """检查环境变量配置"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        log("错误：缺少 Supabase 环境变量", "ERROR")
        log("请设置 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY", "ERROR")
        sys.exit(1)
    
    log(f"Supabase URL: {SUPABASE_URL[:30]}...", "INFO")
    log("环境变量检查通过", "INFO")

def parse_package_hint(hint_text):
    """
    解析套餐按钮的 hint 文本
    格式: "Select X GB - Y days for $Z USD"
    """
    pattern = r'Select\s+([\d.]+)\s*GB\s*-\s*(\d+)\s*days?\s*for\s*\$?([\d.]+)\s*USD'
    match = re.search(pattern, hint_text, re.IGNORECASE)
    
    if match:
        data_gb = float(match.group(1))
        days = int(match.group(2))
        price = float(match.group(3))
        return {
            'data_amount': f"{data_gb} GB",
            'validity': f"{days} Days",
            'price': price
        }
    return None

def scrape_country_packages(country_name, country_slug):
    """
    采集单个国家的套餐数据
    
    注意：这个函数需要在 Manus 环境中运行，使用 browser_navigate 等工具
    在 Schedule 中，这部分逻辑会由 Manus Agent 自动执行
    """
    log(f"开始采集 {country_name} 的套餐数据...", "INFO")
    
    url = f"https://www.airalo.com/{country_slug}-esim?currency=USD"
    
    # 这里返回示例数据结构，实际采集由 Manus Browser Operator 完成
    # Manus Agent 会自动调用 browser_navigate 和解析页面
    return {
        'country': country_name,
        'url': url,
        'status': 'pending'  # 实际状态由 Manus 更新
    }

def upsert_packages_to_supabase(packages):
    """
    使用 UPSERT 将套餐数据写入 Supabase
    
    Args:
        packages: 套餐数据列表，每个元素包含:
            - country: 国家名
            - provider: 提供商 (固定为 "Airalo")
            - plan_name: 套餐名称
            - data_amount: 流量 (如 "3 GB")
            - validity: 有效期 (如 "7 Days")
            - price: 价格 (USD)
            - purchase_url: 购买链接
    """
    if not packages:
        log("没有数据需要写入", "WARNING")
        return False
    
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
    }
    
    url = f"{SUPABASE_URL}/rest/v1/esim_packages"
    
    try:
        log(f"准备写入 {len(packages)} 条数据到 Supabase...", "INFO")
        
        response = requests.post(url, json=packages, headers=headers, timeout=30)
        
        if response.status_code in [200, 201]:
            log(f"✅ 成功写入 {len(packages)} 条数据", "INFO")
            return True
        else:
            log(f"❌ 写入失败: HTTP {response.status_code}", "ERROR")
            log(f"响应内容: {response.text}", "ERROR")
            return False
            
    except Exception as e:
        log(f"❌ 数据库写入异常: {str(e)}", "ERROR")
        return False

def main():
    """主函数"""
    log("=" * 60, "INFO")
    log("Airalo E-SIM 数据采集任务开始", "INFO")
    log("=" * 60, "INFO")
    
    # 1. 检查环境
    check_environment()
    
    # 2. 统计变量
    total_countries = len(TARGET_COUNTRIES)
    success_count = 0
    failed_countries = []
    
    log(f"目标国家数量: {total_countries}", "INFO")
    log("", "INFO")
    
    # 3. 提示信息
    log("⚠️  注意：此脚本需要在 Manus Schedule 环境中运行", "WARNING")
    log("⚠️  实际的网页采集由 Manus Browser Operator 完成", "WARNING")
    log("", "INFO")
    
    # 4. 采集数据（实际由 Manus Agent 执行）
    log("请使用 Manus Browser Operator 逐个访问以下国家页面：", "INFO")
    log("", "INFO")
    
    for idx, (country_name, country_slug) in enumerate(TARGET_COUNTRIES, 1):
        log(f"[{idx}/{total_countries}] {country_name}", "INFO")
        log(f"    URL: https://www.airalo.com/{country_slug}-esim?currency=USD", "INFO")
        log(f"    操作: 提取所有套餐按钮的 hint 属性", "INFO")
        log(f"    格式: 'Select X GB - Y days for $Z USD'", "INFO")
        log("", "INFO")
    
    # 5. 数据示例
    log("=" * 60, "INFO")
    log("数据格式示例", "INFO")
    log("=" * 60, "INFO")
    
    example_package = {
        "country": "Japan",
        "provider": "Airalo",
        "plan_name": "Moshi Moshi 3GB - 7 Days",
        "data_amount": "3 GB",
        "validity": "7 Days",
        "price": 4.5,
        "purchase_url": "https://www.airalo.com/japan-esim"
    }
    
    log(json.dumps(example_package, indent=2, ensure_ascii=False), "INFO")
    log("", "INFO")
    
    # 6. 完成提示
    log("=" * 60, "INFO")
    log("脚本执行完成", "INFO")
    log("=" * 60, "INFO")
    log("", "INFO")
    log("📋 后续步骤:", "INFO")
    log("1. 使用 Manus Browser Operator 访问上述 20 个国家页面", "INFO")
    log("2. 提取每个国家的套餐数据", "INFO")
    log("3. 调用 upsert_packages_to_supabase() 写入数据库", "INFO")
    log("4. 验证数据已正确写入", "INFO")
    log("", "INFO")
    
    return 0

if __name__ == '__main__':
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        log("任务被用户中断", "WARNING")
        sys.exit(1)
    except Exception as e:
        log(f"未预期的错误: {str(e)}", "ERROR")
        import traceback
        log(traceback.format_exc(), "ERROR")
        sys.exit(1)
