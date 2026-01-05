#!/usr/bin/env python3
"""
每日定时爬虫 - 抓取 20 个热门国家的 E-SIM 数据
"""

import sys
import json
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

sys.path.insert(0, '/home/ubuntu/globalpass/scripts')

from airalo_final import scrape_airalo_country
from nomad_scraper import scrape_nomad_country
import pymysql
import os
from urllib.parse import urlparse

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 邮件配置
ALERT_EMAIL = "lihm519@gmail.com"

# 解析数据库 URL
DB_URL = os.getenv('DATABASE_URL', '')
url = urlparse(DB_URL)
db_config = {
    'host': url.hostname,
    'port': url.port or 3306,
    'user': url.username,
    'password': url.password,
    'database': url.path.lstrip('/').split('?')[0],
    'ssl': {'ssl': True} if 'ssl' in url.query else None,
}

# 20 个热门国家列表（按旅游热度排序）
# 格式: (国家名, Airalo slug, Nomad slug)
POPULAR_COUNTRIES = [
    ("USA", "united-states", "united-states"),
    ("Japan", "japan", "japan"),
    ("Thailand", "thailand", "thailand"),
    ("UK", "united-kingdom", "united-kingdom"),
    ("France", "france", "france"),
    ("Germany", "germany", "germany"),
    ("Italy", "italy", "italy"),
    ("Spain", "spain", "spain"),
    ("South Korea", "south-korea", "south-korea"),
    ("Singapore", "singapore", "singapore"),
    ("Australia", "australia", "australia"),
    ("Canada", "canada", "canada"),
    ("China", "china", "china"),
    ("Hong Kong", "hong-kong", "hong-kong"),
    ("Taiwan", "taiwan", "taiwan"),
    ("Malaysia", "malaysia", "malaysia"),
    ("Vietnam", "vietnam", "vietnam"),
    ("Indonesia", "indonesia", "indonesia"),
    ("Philippines", "philippines", "philippines"),
    ("India", "india", "india"),
]

def send_alert_email(subject, body):
    """发送告警邮件"""
    try:
        # 注意：这里需要配置 SMTP 服务器
        # 由于没有 SMTP 配置，这里只是记录日志
        logger.error(f"📧 需要发送告警邮件到 {ALERT_EMAIL}")
        logger.error(f"   主题: {subject}")
        logger.error(f"   内容: {body}")
        
        # TODO: 配置 SMTP 服务器后取消注释
        # msg = MIMEMultipart()
        # msg['From'] = "noreply@globalpass.com"
        # msg['To'] = ALERT_EMAIL
        # msg['Subject'] = subject
        # msg.attach(MIMEText(body, 'plain'))
        # 
        # server = smtplib.SMTP('smtp.gmail.com', 587)
        # server.starttls()
        # server.login("your_email@gmail.com", "your_password")
        # server.send_message(msg)
        # server.quit()
        
    except Exception as e:
        logger.error(f"发送邮件失败: {e}")

def scrape_and_import():
    """抓取数据并导入数据库"""
    
    start_time = datetime.now()
    logger.info("=" * 70)
    logger.info(f"🚀 开始每日数据抓取 - {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("=" * 70)
    
    try:
        # 连接数据库
        conn = pymysql.connect(**db_config)
        cur = conn.cursor()
        
        # 清空现有数据
        logger.info("清空现有数据...")
        cur.execute("DELETE FROM esim_packages WHERE provider IN ('Airalo', 'Nomad')")
        conn.commit()
        
        total_packages = 0
        failed_countries = []
        
        for country_name, airalo_slug, nomad_slug in POPULAR_COUNTRIES:
            try:
                # 抓取 Airalo
                airalo_packages = scrape_airalo_country(country_name, airalo_slug)
                
                # 抓取 Nomad
                nomad_packages = scrape_nomad_country(country_name, nomad_slug)
                
                # 合并套餐
                packages = airalo_packages + nomad_packages
                
                if not packages:
                    logger.warning(f"⚠️  {country_name}: 未获取到数据")
                    failed_countries.append(country_name)
                    continue
                
                logger.info(f"✅ {country_name}: {len(packages)} 个套餐")
                
                # 插入数据库
                for pkg in packages:
                    cur.execute("""
                        INSERT INTO esim_packages (
                            provider, country, planName, dataType, dataAmount,
                            validity, price, network, link, rawData, lastChecked
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        pkg['provider'],
                        pkg['country'],
                        pkg['plan_name'],
                        pkg['data_type'],
                        pkg['data_amount'],
                        pkg['validity'],
                        pkg['price'],
                        pkg['network'],
                        pkg['link'],
                        pkg['raw_data'],
                        pkg['last_checked']
                    ))
                
                conn.commit()
                total_packages += len(packages)
                
            except Exception as e:
                logger.error(f"❌ {country_name} 抓取失败: {e}")
                failed_countries.append(country_name)
        
        cur.close()
        conn.close()
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        logger.info("=" * 70)
        logger.info(f"✅ 抓取完成！")
        logger.info(f"   总套餐数: {total_packages}")
        logger.info(f"   成功国家: {len(POPULAR_COUNTRIES) - len(failed_countries)}/{len(POPULAR_COUNTRIES)}")
        logger.info(f"   耗时: {duration:.1f} 秒")
        logger.info("=" * 70)
        
        # 如果有失败的国家，发送告警邮件
        if failed_countries:
            subject = f"GlobalPass 爬虫告警 - {len(failed_countries)} 个国家抓取失败"
            body = f"""
爬取时间: {start_time.strftime('%Y-%m-%d %H:%M:%S')}
成功国家: {len(POPULAR_COUNTRIES) - len(failed_countries)}/{len(POPULAR_COUNTRIES)}
失败国家: {', '.join(failed_countries)}
总套餐数: {total_packages}
耗时: {duration:.1f} 秒

请检查日志获取详细信息。
"""
            send_alert_email(subject, body)
        
        return True
        
    except Exception as e:
        logger.error(f"❌ 爬虫运行失败: {e}")
        
        # 发送失败告警
        subject = "GlobalPass 爬虫严重错误"
        body = f"""
爬取时间: {start_time.strftime('%Y-%m-%d %H:%M:%S')}
错误信息: {str(e)}

请立即检查系统状态。
"""
        send_alert_email(subject, body)
        
        return False

if __name__ == "__main__":
    scrape_and_import()
