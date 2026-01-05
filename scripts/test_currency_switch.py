#!/usr/bin/env python3
"""
测试 Airalo 币种切换
"""

import time
from playwright.sync_api import sync_playwright

def test_currency_switch():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # 非 headless 模式方便观察
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            locale='en-US'
        )
        
        # 设置 Cookie
        context.add_cookies([
            {
                'name': 'currency',
                'value': 'USD',
                'domain': '.airalo.com',
                'path': '/'
            }
        ])
        
        page = context.new_page()
        
        # 访问 Airalo Japan 页面
        url = "https://www.airalo.com/japan-esim"
        print(f"访问: {url}")
        page.goto(url, wait_until="networkidle", timeout=30000)
        
        # 等待页面加载
        print("等待 5 秒...")
        time.sleep(5)
        
        # 查找套餐容器
        package_containers = page.query_selector_all('[data-testid="card-package_container"]')
        print(f"\n找到 {len(package_containers)} 个套餐")
        
        if package_containers:
            print("\n前 3 个套餐:")
            for i, container in enumerate(package_containers[:3]):
                text = container.inner_text()
                print(f"\n套餐 {i+1}:")
                print(text[:100])
        
        browser.close()

if __name__ == '__main__':
    test_currency_switch()
