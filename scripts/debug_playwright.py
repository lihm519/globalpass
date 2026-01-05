#!/usr/bin/env python3
"""
Playwright 调试脚本 - 查看 Airalo 页面的实际内容
"""

import time
from playwright.sync_api import sync_playwright

def debug_airalo():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        page = context.new_page()
        
        # 访问 Airalo Japan 页面
        url = "https://www.airalo.com/japan-esim?currency=USD"
        print(f"访问: {url}")
        page.goto(url, wait_until="networkidle", timeout=30000)
        
        # 等待页面加载
        print("等待 5 秒...")
        time.sleep(5)
        
        # 查找所有按钮
        all_buttons = page.query_selector_all('button')
        print(f"\n找到 {len(all_buttons)} 个按钮")
        
        # 查找带 hint 属性的按钮
        hint_buttons = page.query_selector_all('button[hint]')
        print(f"找到 {len(hint_buttons)} 个带 hint 属性的按钮")
        
        if hint_buttons:
            print("\n前 3 个 hint 属性:")
            for i, button in enumerate(hint_buttons[:3]):
                hint = button.get_attribute('hint')
                print(f"  {i+1}. {hint}")
        else:
            print("\n没有找到带 hint 属性的按钮！")
            print("\n尝试查找其他可能的选择器...")
            
            # 尝试其他选择器
            selectors = [
                'button[aria-label*="Select"]',
                'button[aria-label*="GB"]',
                'div[data-testid*="package"]',
                'button:has-text("Select")',
                '[data-testid="card-package_container"]',
            ]
            
            for selector in selectors:
                elements = page.query_selector_all(selector)
                print(f"  {selector}: {len(elements)} 个元素")
            
            # 查看套餐容器的文本内容
            package_containers = page.query_selector_all('[data-testid="card-package_container"]')
            if package_containers:
                print(f"\n前 2 个套餐容器的文本内容:")
                for i, container in enumerate(package_containers[:2]):
                    text = container.inner_text()
                    print(f"\n套餐 {i+1}:")
                    print(text[:200])  # 只显示前 200 个字符
        
        # 保存页面 HTML
        html = page.content()
        with open('/home/ubuntu/airalo_page_debug.html', 'w', encoding='utf-8') as f:
            f.write(html)
        print("\n页面 HTML 已保存到 /home/ubuntu/airalo_page_debug.html")
        
        # 保存截图
        page.screenshot(path='/home/ubuntu/airalo_page_debug.png')
        print("页面截图已保存到 /home/ubuntu/airalo_page_debug.png")
        
        browser.close()

if __name__ == '__main__':
    debug_airalo()
