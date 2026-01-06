"""
调试 Selenium 爬虫 - 查看实际抓取的内容
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time

# 初始化浏览器
chrome_options = Options()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')

driver = webdriver.Chrome(options=chrome_options)

try:
    url = "https://www.airalo.com/japan-esim"
    print(f"访问: {url}\n")
    
    driver.get(url)
    time.sleep(5)  # 等待页面加载
    
    # 查找所有链接
    links = driver.find_elements(By.TAG_NAME, "a")
    
    print(f"找到 {len(links)} 个链接\n")
    print("前 30 个链接的信息：\n")
    
    for i, link in enumerate(links[:30]):
        try:
            text = link.text.strip()
            hint = link.get_attribute("hint") or ""
            href = link.get_attribute("href") or ""
            
            if text or hint:
                print(f"{i+1}. Text: {text[:50]}")
                if hint:
                    print(f"   Hint: {hint[:100]}")
                if "GB" in text or "USD" in text or "GB" in hint or "USD" in hint:
                    print(f"   ⭐ 可能是套餐链接")
                print()
        except:
            continue

finally:
    driver.quit()
