# GlobalPass 系统文档

## 📋 项目概述

GlobalPass 是一个全球 E-SIM 比价与手机兼容性检测平台，帮助用户快速找到最优惠的国际数据套餐。

- **网站地址**：https://www.globalpass.tech/
- **GitHub 仓库**：https://github.com/lihm519/globalpass
- **技术栈**：Next.js, Supabase, GitHub Actions, Manus Browser Operator

---

## 🏗️ 系统架构

### 混合爬虫架构（Hybrid Scraper Architecture）

```
┌─────────────────────────────────────────────────┐
│  GitHub Actions (每天 UTC 20:00)                │
│  ├─ Nomad 爬虫 (Selenium/Playwright)            │
│  ├─ 频率：每天自动运行                          │
│  ├─ 成本：免费（GitHub 额度）                   │
│  └─ 写入 Supabase ✅                            │
└─────────────────────────────────────────────────┘
                    +
┌─────────────────────────────────────────────────┐
│  Manus Schedule (每周日 UTC 20:30)              │
│  ├─ Airalo 爬虫 (Browser Operator)              │
│  ├─ 频率：每周一次（周日运行）                  │
│  ├─ 成本：消耗 Manus 积分                       │
│  └─ 写入 Supabase ✅                            │
└─────────────────────────────────────────────────┘
```

### 为什么采用混合架构？

1. **Nomad**：网站结构简单，Selenium 可以正常爬取，使用免费的 GitHub Actions
2. **Airalo**：有反爬检测，Selenium 失效，使用 Manus Browser Operator（真实浏览器环境）
3. **成本优化**：Airalo 改为每周运行，积分消耗减少约 85%

---

## 📊 数据管理

### 当前数据状态（2026-02-02）

**数据库统计**：
- **总套餐数**：441 个
- **Airalo**：243 个套餐（20/20 国家）✅
- **Nomad**：198 个套餐（20/20 国家）✅
- **覆盖国家**：20 个授权国家

**各国数据详情**：

| 国家 | Airalo | Nomad | 总计 |
|------|--------|-------|------|
| Australia | 12 | 12 | 24 |
| Canada | 12 | 10 | 22 |
| China | 12 | 13 | 25 |
| France | 12 | 10 | 22 |
| Germany | 12 | 10 | 22 |
| Hong Kong | 12 | 10 | 22 |
| India | 12 | 8 | 20 |
| Indonesia | 12 | 9 | 21 |
| Italy | 12 | 10 | 22 |
| Japan | 11 | 12 | 23 |
| Malaysia | 12 | 8 | 20 |
| Philippines | 12 | 8 | 20 |
| Singapore | 12 | 9 | 21 |
| South Korea | 14 | 11 | 25 |
| Spain | 12 | 9 | 21 |
| Taiwan | 12 | 10 | 22 |
| Thailand | 13 | 6 | 19 |
| UK | 12 | 10 | 22 |
| USA | 13 | 14 | 27 |
| Vietnam | 12 | 9 | 21 |

### 数据源

**配置文件**：`config/countries.json`（20 个授权国家）
```json
[
  {"name": "Japan", "slug": "japan"},
  {"name": "South Korea", "slug": "south-korea"},
  ...
]
```

**数据库**：Supabase PostgreSQL
- 表名：`esim_packages`
- 唯一键约束：`(provider, country, plan_name)`
- UPSERT 逻辑：自动更新已存在数据
- **重要**：国家名称必须使用标准化格式（UK 而非 United Kingdom，USA 而非 United States）

**前端数据**：`public/data/esim-packages.json`
- 从 Supabase 生成
- 格式：`{ "packages": { "国家名": [套餐数组] } }`
- 部署时自动更新

### 数据一致性保证

**严格规则**：
1. ✅ 只允许 `config/countries.json` 中定义的 20 个国家
2. ✅ 数据库、JSON 文件、配置文件必须完全一致
3. ✅ 不允许出现任何未授权国家
4. ✅ 国家名称必须统一（UK, USA 而非全称）

**验证方法**：
```bash
# 检查数据库国家数量
python3 scripts/check_consistency.py

# 检查 JSON 文件
jq '.packages | keys | length' public/data/esim-packages.json
```

---

## 🤖 自动化系统

### GitHub Actions 配置

**文件**：`.github/workflows/daily-scraper.yml`

**触发时间**：每天 UTC 20:00（北京时间凌晨 4:00）

**运行步骤**：
1. 设置 Python 和 Chrome 环境
2. 安装依赖
3. 运行 `scripts/universal_scraper_selenium.py`
4. 上传日志到 Artifacts

**环境变量**：
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Manus Schedule 配置

**任务名称**：Weekly Airalo eSIM Data Scraper

**触发时间**：每周日 UTC 20:30（北京时间周一凌晨 4:30）

**Cron 表达式**：`0 30 20 * * 0`

**运行逻辑**：
1. 读取 `config/countries.json`
2. 使用 Browser Operator 访问 Airalo 页面
3. 提取套餐数据（hint 属性）
4. UPSERT 到 Supabase

**环境变量**（已配置在 Manus）：
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**数据采集方法**：
```python
# 访问 Airalo 国家页面
browser_navigate(f"https://www.airalo.com/{country_slug}-esim?currency=USD")

# 提取套餐按钮的 hint 属性
hints = [button.hint for button in page.buttons if "Select" in button.hint]

# 解析 hint 获取套餐信息
# 格式: "Select 1 GB - 3 days for $4.00 USD."
regex = r'Select\s+(.+?)\s+for\s+\$([0-9.]+)\s+USD'

# UPSERT 到 Supabase
```

---

## 🔧 核心脚本

### 1. `scripts/universal_scraper_selenium.py`

**功能**：Nomad 数据爬取（GitHub Actions）

**关键特性**：
- 支持 Selenium 和 Playwright
- UPSERT 逻辑（先查询，存在则更新，不存在则插入）
- 正确处理 HTTP 204 状态码
- 错误处理和日志记录

**UPSERT 逻辑**：
```python
# 1. 查询是否存在
check_url = f"{SUPABASE_URL}/rest/v1/esim_packages?provider=eq.{provider}&country=eq.{country}&plan_name=eq.{plan_name}"
resp = requests.get(check_url, headers=headers)

if resp.json():
    # 2. 存在则更新
    update_url = f"{SUPABASE_URL}/rest/v1/esim_packages?provider=eq.{provider}&country=eq.{country}&plan_name=eq.{plan_name}"
    requests.patch(update_url, json=data, headers=headers)
else:
    # 3. 不存在则插入
    requests.post(f"{SUPABASE_URL}/rest/v1/esim_packages", json=data, headers=headers)
```

### 2. Airalo 数据采集（Manus Browser Operator）

**实现方式**：在 Manus 中手动运行

**数据提取关键点**：
```python
# 从按钮 hint 属性提取数据
# 示例 hint: "Select 1 GB - 3 days for $4.00 USD."

import re
match = re.search(r'Select\s+(.+?)\s+for\s+\$([0-9.]+)\s+USD', hint)
if match:
    full_text = match.group(1)  # "1 GB - 3 days"
    price = float(match.group(2))  # 4.0
    
    parts = full_text.split(' - ')
    data_amount = parts[0].strip()  # "1 GB"
    validity = parts[1].strip()  # "3 days"
```

**国家名称标准化**：
```python
# 数据库中必须使用统一名称
name_mapping = {
    'United Kingdom': 'UK',
    'United States': 'USA'
}
```

### 3. 前端 JSON 生成脚本

**功能**：从 Supabase 生成 `public/data/esim-packages.json`

**正确的 JSON 格式**：
```json
{
  "packages": {
    "Japan": [
      {
        "id": 1670,
        "provider": "Airalo",
        "country": "Japan",
        "plan_name": "Japan 1 GB 3 days",
        "data_type": "Data",
        "data_amount": "1 GB",
        "validity": "3 days",
        "price": 4.0,
        "network": "",
        "link": "https://www.airalo.com/japan-esim?currency=USD",
        "last_checked": "2026-02-02T18:54:58.783527"
      }
    ]
  }
}
```

**生成脚本**：
```python
import requests, json

SUPABASE_URL = "..."
SUPABASE_KEY = "..."
headers = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}'}

# Query all packages
resp = requests.get(f"{SUPABASE_URL}/rest/v1/esim_packages?select=*", headers=headers)
packages = resp.json()

# Group by country
country_packages = {}
for pkg in packages:
    country = pkg['country']
    if country not in country_packages:
        country_packages[country] = []
    
    country_packages[country].append({
        "id": pkg['id'],
        "provider": pkg['provider'],
        "country": pkg['country'],
        "plan_name": pkg['plan_name'],
        "data_type": pkg.get('data_type', 'Data'),
        "data_amount": pkg['data_amount'],
        "validity": pkg['validity'],
        "price": pkg['price'],
        "network": "",
        "link": pkg['link'],
        "last_checked": pkg['last_checked']
    })

# Write to file
output = {"packages": country_packages}
with open('public/data/esim-packages.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)
```

---

## 📅 运行时间表

| 任务 | 频率 | 运行时间（UTC） | 运行时间（北京） | 平台 |
|------|------|----------------|------------------|------|
| **Nomad 数据更新** | 每天 | 20:00 | 凌晨 4:00 | GitHub Actions |
| **Airalo 数据更新** | 每周日 | 20:30 | 周一凌晨 4:30 | Manus Schedule |

---

## 🚀 部署流程

### 完整的 Airalo 数据更新流程

```bash
# 1. 在 Manus 中运行 Airalo 数据采集任务
# （手动操作，逐个访问 20 个国家页面）

# 2. 验证数据库更新
python3 << 'EOF'
import requests
SUPABASE_URL = "..."
SUPABASE_KEY = "..."
headers = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}'}
resp = requests.get(f"{SUPABASE_URL}/rest/v1/esim_packages?provider=eq.Airalo&select=country", headers=headers)
countries = set([item['country'] for item in resp.json()])
print(f"Airalo 覆盖 {len(countries)} 个国家: {sorted(countries)}")
EOF

# 3. 生成前端 JSON
cd /home/ubuntu/globalpass
python3 << 'EOF'
# [使用上面的生成脚本]
EOF

# 4. 提交并推送
git add public/data/esim-packages.json
git commit -m "Update: Airalo eSIM packages data"
git push github main

# 5. Vercel 自动检测并部署（1-2 分钟）
```

### 方式 2：通过 Git 推送（仅数据更新）

```bash
cd /home/ubuntu/globalpass

# 1. 更新 JSON 文件
python3 [生成脚本]

# 2. 提交并推送
git add public/data/esim-packages.json
git commit -m "Update: eSIM packages data"
git push github main

# 3. Vercel 自动检测并部署（1-2 分钟）
```

---

## 🔍 故障排查

### 问题 1：爬虫运行失败

**检查步骤**：
1. 查看 GitHub Actions 日志：https://github.com/lihm519/globalpass/actions
2. 检查环境变量是否配置正确
3. 检查 Supabase 连接是否正常

**常见错误**：
- `409 Conflict`：UPSERT 逻辑问题（已修复）
- `204 No Content`：成功响应，不是错误（已修复）
- `403 Forbidden`：反爬检测（改用 Manus Browser Operator）

### 问题 2：数据不一致

**症状**：网站显示未授权国家或国家名称不统一

**解决方法**：
```bash
# 1. 统一国家名称
python3 << 'EOF'
import requests

SUPABASE_URL = "..."
SUPABASE_KEY = "..."
headers = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}', 'Content-Type': 'application/json', 'Prefer': 'return=representation'}

# Update United Kingdom to UK
resp = requests.patch(
    f"{SUPABASE_URL}/rest/v1/esim_packages?country=eq.United Kingdom",
    json={"country": "UK"},
    headers=headers
)

# Update United States to USA  
resp2 = requests.patch(
    f"{SUPABASE_URL}/rest/v1/esim_packages?country=eq.United States",
    json={"country": "USA"},
    headers=headers
)
EOF

# 2. 重新生成 JSON
python3 [生成脚本]

# 3. 部署更新
git add public/data/esim-packages.json
git commit -m "Fix: Unify country names"
git push github main
```

### 问题 3：前端无数据显示

**可能原因**：
1. JSON 格式不正确
2. CDN 缓存
3. 部署未完成

**检查方法**：
```bash
# 1. 验证 JSON 格式
jq '.packages | keys' public/data/esim-packages.json

# 2. 检查是否包含 packages 键
jq 'has("packages")' public/data/esim-packages.json

# 3. 验证数据结构
jq '.packages.Japan[0]' public/data/esim-packages.json
```

**解决方法**：
- 确保 JSON 格式为 `{ "packages": { "国家": [数组] } }`
- 强制刷新浏览器（Ctrl + Shift + R）
- 等待 Vercel 部署完成（查看 GitHub Actions 或 Vercel Dashboard）

### 问题 4：网站显示旧数据

**原因**：CDN 缓存

**解决方法**：
1. 强制刷新浏览器（Ctrl + Shift + R）
2. 等待 CDN 缓存过期（通常 5-10 分钟）
3. 清除浏览器缓存

---

## 📈 未来扩展策略

### 添加新运营商

**优先级顺序**：

**1️⃣ 优先方案：GitHub Actions + Selenium/Playwright**
- ✅ 免费（每月 2000 分钟额度）
- ✅ 每天自动运行
- ✅ 不消耗 Manus 积分
- ⚠️ 可能遇到反爬检测

**2️⃣ 备选方案：Manus Browser Operator**
- ✅ 不会被反爬检测（真实浏览器）
- ✅ 数据提取更可靠
- ⚠️ 消耗 Manus 积分
- 💡 建议手动触发（降低成本）

**实施流程**：
1. 先在 GitHub Actions 中测试 Selenium 爬虫
2. 如果遇到反爬或数据提取失败
3. 再改用 Manus Browser Operator
4. 根据积分消耗情况调整运行频率（每天/每周/手动）

### 添加新国家

**步骤**：
1. 更新 `config/countries.json`
2. 测试爬虫是否支持该国家
3. 清理数据库中的旧数据（如果需要）
4. 重新运行爬虫

---

## 🔐 安全与凭证

### Supabase 凭证

**存储位置**：
- GitHub Secrets（用于 GitHub Actions）
- Manus Secrets（用于 Manus Browser Operator）

**凭证内容**：
- `SUPABASE_URL`：https://mzodnvjtlujvvwfnpcyb.supabase.co
- `SUPABASE_SERVICE_ROLE_KEY`：（敏感信息，不在文档中显示）

**安全建议**：
- ✅ 不要在代码中硬编码凭证
- ✅ 使用环境变量
- ✅ 定期轮换 Service Role Key

---

## 🤖 AI 对话功能

### 架构设计

**前后端分离架构**：
```
用户浏览器 → /api/chat (Next.js API Route) → Google Generative AI
```

**为什么使用后端 API Route？**
- ✅ 避免 CORS 跨域问题
- ✅ 保护 API Key 安全（不暴露在前端）
- ✅ 统一错误处理和日志记录

### 技术实现

**后端 API**：`app/api/chat/route.ts`
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

// 使用 gemini-2.0-flash 模型（稳定版本）
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
```

**前端组件**：`components/AIChatDialog.tsx`
```typescript
// 调用后端 API
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ message, packages })
});
```

### 功能特性

1. **智能套餐推荐**
   - 根据用户需求（国家、天数、流量）推荐最合适的套餐
   - 自动筛选并按价格排序
   - 显示前 3 个最便宜的选项

2. **多语言支持**
   - 自动检测用户输入语言
   - 用相同语言回复（中文、英文、日文等）
   - 无需手动切换语言

3. **可视化套餐卡片**
   - 显示提供商、价格、流量、有效期
   - 点击卡片直接跳转到购买链接
   - 区分 Airalo 和 Nomad 提供商

### 环境配置

**Vercel 环境变量**：
- `NEXT_PUBLIC_GEMINI_API_KEY`：Google Generative AI API Key
- 配置路径：Vercel Dashboard → Settings → Environment Variables

**模型版本历史**：
- ❌ `gemini-2.0-flash-exp`：实验版本已被 Google 移除
- ✅ `gemini-2.0-flash`：当前使用的稳定版本

### 故障排查

**问题：AI 返回 404 错误**

**诊断步骤**：
```bash
# 1. 测试 API Key 是否有效
node scripts/diagnose_google_key.js

# 2. 测试模型是否可用
node -e "
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('YOUR_API_KEY');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
model.generateContent('Hello').then(r => console.log(r.response.text()));
"
```

**常见原因**：
1. API Key 未配置或失效
2. 模型名称错误（使用了已废弃的版本）
3. Google API 权限未开通

---

## 📝 维护日志

### 2026-02-02：AI 对话功能修复与优化

**问题描述**：
- AI 对话功能报 404 错误
- 错误信息：`models/gemini-2.0-flash-exp is not found for API version v1beta`

**问题根源**：
1. **前端直接调用 Google API**：遇到 CORS 跨域限制
2. **模型版本过期**：`gemini-2.0-flash-exp` 实验版本已被 Google 移除

**解决方案**：
1. **创建后端 API Route**：
   - 新建 `app/api/chat/route.ts`
   - 在服务端调用 Google Generative AI
   - 避免 CORS 问题

2. **更新模型版本**：
   - 从 `gemini-2.0-flash-exp` 更新为 `gemini-2.0-flash`
   - 使用稳定版本确保长期可用

3. **添加多语言支持**：
   - 更新 AI prompt，要求用相同语言回复
   - 支持中文、英文、日文等所有语言

**诊断过程**：
- 创建诊断脚本 `scripts/diagnose_google_key.js`
- 测试 47 个可用模型
- 发现 `listModels` 成功但 `generateContent` 失败
- 最终确认 `gemini-2.0-flash` 可用

**相关 Commit**：
- `4577fd7`: 创建后端 API Route
- `b198583`: 更新为 gemini-2.0-flash
- `2c6e01c`: 添加多语言支持

---

### 2026-02-02：Airalo 数据采集完成

**完成内容**：
- ✅ 采集所有 20 个授权国家的 Airalo 数据（243 个套餐）
- ✅ 修复国家名称不一致问题（统一为 UK/USA）
- ✅ 修复前端 JSON 格式问题（正确格式：`{ "packages": {...} }`）
- ✅ 部署到生产环境（https://www.globalpass.tech/）

**数据统计**：
- Airalo: 243 个套餐（20/20 国家）
- Nomad: 198 个套餐（20/20 国家）
- 总计: 441 个套餐

**技术要点**：
- 使用 Manus Browser Operator 逐个访问国家页面
- 从按钮 hint 属性提取套餐信息
- 使用正则表达式解析 "Select X GB - Y days for $Z USD" 格式
- UPSERT 到 Supabase 避免重复数据

**遇到的问题与解决**：
1. **并行采集失败**：改为串行方式逐个采集
2. **国家名称不一致**：使用 PATCH API 统一更新为标准名称
3. **前端无数据显示**：修正 JSON 格式为前端期望的结构

---

## 📞 联系与支持

**项目维护者**：lihm519

**问题反馈**：
- GitHub Issues：https://github.com/lihm519/globalpass/issues
- Manus 帮助中心：https://help.manus.im

---

**文档版本**：v2.1  
**最后更新**：2026-02-02  
**维护状态**：活跃维护中 ✅
