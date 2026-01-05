"""
调试 Selenium - 查看实际获取的 HTML 内容
"""
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import re

chrome_options = Options()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')

driver = webdriver.Chrome(options=chrome_options)

try:
    url = "https://www.airalo.com/japan-esim"
    print(f"访问: {url}\n")
    
    driver.get(url)
    time.sleep(5)
    
    # 获取页面 HTML
    page_source = driver.page_source
    
    # 查找 hint 属性
    hint_pattern = r'hint="([^"]*)"'
    hints = re.findall(hint_pattern, page_source)
    
    print(f"找到 {len(hints)} 个 hint 属性\n")
    
    # 只显示包含 "Select" 和 "GB" 的 hint
    package_hints = [h for h in hints if "Select" in h and ("GB" in h or "Unlimited" in h)]
    
    print(f"套餐相关的 hint ({len(package_hints)} 个):\n")
    for hint in package_hints:
        print(f"  - {hint}")
    
    # 如果没有找到，显示前 500 个字符的 HTML
    if not package_hints:
        print("\n没有找到套餐 hint，显示 HTML 前 1000 个字符:\n")
        print(page_source[:1000])

finally:
    driver.quit()
