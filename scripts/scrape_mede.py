#!/usr/bin/env python3
"""
Mede E-SIM 数据采集脚本 (手动触发版本)

功能：
- 使用 Manus Browser Operator 访问 Mede 网站
- 采集 20 个国家的 E-SIM 套餐数据
- 使用 UPSERT 写入 Supabase 数据库
- 完整的错误处理和日志记录

运行方式：
    python3 scripts/scrape_mede.py

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

# Mede 联盟链接
MEDE_AFFILIATE_LINK = "https://aisontechnologycolimited.sjv.io/e1OG3D"

# 20 个目标国家（国家名称和国家代码）
TARGET_COUNTRIES = [
    ('Japan', 'JP'),
    ('South Korea', 'KR'),
    ('Thailand', 'TH'),
    ('Singapore', 'SG'),
    ('Hong Kong', 'HK'),
    ('Taiwan', 'TW'),
    ('Malaysia', 'MY'),
    ('Indonesia', 'ID'),
    ('Philippines', 'PH'),
    ('Vietnam', 'VN'),
    ('United States', 'US'),
    ('Britain', 'GB'),  # Mede uses "Britain" not "UK"
    ('France', 'FR'),
    ('Germany', 'DE'),
    ('Italy', 'IT'),
    ('Spain', 'ES'),
    ('Australia', 'AU'),
    ('Canada', 'CA'),
    ('India', 'IN'),
    ('China', 'CN')  # May be "China Mainland" on site
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

def parse_package_text(text):
    """
    解析套餐文本
    格式: "{Country}{Data}{Validity} {Data} data {Validity} USD($) {Price}"
    示例: "Japan3GB5 Day 3GB data 5 Day USD($) 3.68"
    
    Returns:
        dict: {'data_amount': '3 GB', 'validity': '5 Days', 'price': 3.68}
        None: 解析失败
    """
    # 提取数据量、有效期和价格
    # Pattern: {Data}GB data {Validity} Day USD($) {Price}
    pattern = r'(\d+(?:\.\d+)?)\s*GB\s+data\s+(\d+)\s+Day\s+USD\(\$\)\s+([\d.]+)'
    match = re.search(pattern, text)
    
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

def normalize_country_name(mede_country_name):
    """
    标准化国家名称，确保与 GlobalPass 数据库一致
    
    Args:
        mede_country_name: Mede 网站上的国家名称
        
    Returns:
        str: 标准化后的国家名称
    """
    # 国家名称映射表
    country_mapping = {
        'United States': 'USA',
        'Britain': 'UK',
        'China': 'China',
        'China Mainland': 'China',
        'South Korea': 'South Korea',
        'Hong Kong': 'Hong Kong',
        # 其他国家保持原名
    }
    
    return country_mapping.get(mede_country_name, mede_country_name)

def scrape_country_packages(country_name, country_code):
    """
    采集单个国家的套餐数据
    
    注意：这个函数需要在 Manus 环境中运行，使用 browser_navigate 等工具
    实际采集由 Manus Browser Operator 完成
    
    Args:
        country_name: 国家名称（如 "Japan"）
        country_code: 国家代码（如 "JP"）
        
    Returns:
        dict: 包含国家信息和 URL 的字典
    """
    log(f"开始采集 {country_name} 的套餐数据...", "INFO")
    
    # 构建 URL（包含联盟追踪参数）
    url = f"https://www.mede.cc/esim-{country_name}?id={country_code}&im_ref=W8GzMH0XBxyZUnYTiL2u-XUlUku0ZGTPYSwHS00"
    
    return {
        'country': country_name,
        'country_code': country_code,
        'url': url,
        'status': 'pending'
    }

def upsert_packages_to_supabase(packages):
    """
    使用 UPSERT 将套餐数据写入 Supabase
    
    Args:
        packages: 套餐数据列表，每个元素包含:
            - country: 国家名（标准化后）
            - provider: 提供商（固定为 "Mede"）
            - plan_name: 套餐名称
            - data_amount: 流量（如 "3 GB"）
            - validity: 有效期（如 "5 Days"）
            - price: 价格（USD）
            - purchase_url: 购买链接（联盟链接）
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
    log("Mede E-SIM 数据采集任务开始", "INFO")
    log("=" * 60, "INFO")
    
    # 1. 检查环境
    check_environment()
    
    # 2. 统计变量
    total_countries = len(TARGET_COUNTRIES)
    success_count = 0
    failed_countries = []
    
    log(f"目标国家数量: {total_countries}", "INFO")
    log(f"联盟链接: {MEDE_AFFILIATE_LINK}", "INFO")
    log("", "INFO")
    
    # 3. 提示信息
    log("⚠️  注意：此脚本需要配合 Manus Browser Operator 使用", "WARNING")
    log("⚠️  实际的网页采集需要手动执行", "WARNING")
    log("", "INFO")
    
    # 4. 生成采集任务列表
    log("请使用 Manus Browser Operator 逐个访问以下国家页面：", "INFO")
    log("", "INFO")
    
    for idx, (country_name, country_code) in enumerate(TARGET_COUNTRIES, 1):
        url = f"https://www.mede.cc/esim-{country_name}?id={country_code}&im_ref=W8GzMH0XBxyZUnYTiL2u-XUlUku0ZGTPYSwHS00"
        
        log(f"[{idx}/{total_countries}] {country_name} ({country_code})", "INFO")
        log(f"    URL: {url}", "INFO")
        log(f"    操作步骤:", "INFO")
        log(f"      1. 访问上述 URL", "INFO")
        log(f"      2. 等待页面加载完成", "INFO")
        log(f"      3. 如有弹窗，点击关闭或 Accept", "INFO")
        log(f"      4. 提取所有套餐卡片的文本", "INFO")
        log(f"      5. 查找格式: '{country_name}XGBY Day XGB data Y Day USD($) Z.ZZ'", "INFO")
        log("", "INFO")
    
    # 5. 数据格式示例
    log("=" * 60, "INFO")
    log("数据格式示例", "INFO")
    log("=" * 60, "INFO")
    
    example_packages = [
        {
            "country": "Japan",
            "provider": "Mede",
            "plan_name": "Japan 3GB 5 Days",
            "data_amount": "3 GB",
            "validity": "5 Days",
            "price": 3.68,
            "purchase_url": MEDE_AFFILIATE_LINK
        },
        {
            "country": "Singapore",
            "provider": "Mede",
            "plan_name": "Singapore 1GB 7 Days",
            "data_amount": "1 GB",
            "validity": "7 Days",
            "price": 3.18,
            "purchase_url": MEDE_AFFILIATE_LINK
        }
    ]
    
    for pkg in example_packages:
        log(json.dumps(pkg, indent=2, ensure_ascii=False), "INFO")
        log("", "INFO")
    
    # 6. 解析示例
    log("=" * 60, "INFO")
    log("文本解析示例", "INFO")
    log("=" * 60, "INFO")
    
    test_texts = [
        "Japan3GB5 Day 3GB data 5 Day USD($) 3.68",
        "Singapore1GB7 Day 1GB data 7 Day USD($) 3.18",
        "Singapore7GB15 Day 7GB data 15 Day USD($) 10.28 43% off"
    ]
    
    for text in test_texts:
        result = parse_package_text(text)
        if result:
            log(f"✅ 输入: {text}", "INFO")
            log(f"   输出: {json.dumps(result, ensure_ascii=False)}", "INFO")
        else:
            log(f"❌ 解析失败: {text}", "ERROR")
        log("", "INFO")
    
    # 7. 完成提示
    log("=" * 60, "INFO")
    log("脚本执行完成", "INFO")
    log("=" * 60, "INFO")
    log("", "INFO")
    log("📋 后续步骤:", "INFO")
    log("1. 使用 Manus Browser Operator 访问上述 20 个国家页面", "INFO")
    log("2. 提取每个国家的套餐数据", "INFO")
    log("3. 将数据整理为 JSON 格式", "INFO")
    log("4. 调用 upsert_packages_to_supabase() 写入数据库", "INFO")
    log("5. 验证数据已正确写入", "INFO")
    log("", "INFO")
    log("💡 提示:", "INFO")
    log("- 所有套餐的 purchase_url 都使用相同的联盟链接", "INFO")
    log("- 国家名称需要标准化（Britain → UK, United States → USA）", "INFO")
    log("- 忽略折扣标签（如 '19% off'），只提取价格", "INFO")
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
