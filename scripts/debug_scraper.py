#!/usr/bin/env python3
"""
调试脚本：查看 Airalo 和 Nomad 网页的实际文本格式
"""
import requests
from bs4 import BeautifulSoup

def debug_airalo():
    """调试 Airalo 网页"""
    url = "https://www.airalo.com/japan-esim?currency=USD"
    
    print(f"🌐 访问 Airalo: {url}\n")
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    response = requests.get(url, headers=headers, timeout=15)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # 查找所有链接
    links = soup.find_all('a')
    
    print("=" * 60)
    print("Airalo 链接文本（前 50 个）:")
    print("=" * 60)
    
    for i, link in enumerate(links[:50]):
        text = link.get_text(strip=True)
        if text and ('GB' in text or 'USD' in text or '$' in text):
            print(f"{i+1}. [{text}]")
    
    print("\n")

def debug_nomad():
    """调试 Nomad 网页"""
    url = "https://www.getnomad.app/japan-esim"
    
    print(f"🌐 访问 Nomad: {url}\n")
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    response = requests.get(url, headers=headers, timeout=15)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # 查找所有 <li> 元素
    items = soup.find_all('li')
    
    print("=" * 60)
    print("Nomad <li> 文本（前 50 个）:")
    print("=" * 60)
    
    for i, item in enumerate(items[:50]):
        text = item.get_text(strip=True)
        if text and ('GB' in text or 'USD' in text or 'Days' in text.upper()):
            print(f"{i+1}. [{text}]")
    
    print("\n")

if __name__ == "__main__":
    debug_airalo()
    debug_nomad()
