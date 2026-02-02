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

**前端数据**：`public/data/esim-packages.json`
- 从 Supabase 生成
- 部署时自动更新

### 数据一致性保证

**严格规则**：
1. ✅ 只允许 `config/countries.json` 中定义的 20 个国家
2. ✅ 数据库、JSON 文件、配置文件必须完全一致
3. ✅ 不允许出现任何未授权国家

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

**任务名称**：Daily Airalo eSIM Data Scraper

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

### 2. Airalo 爬虫（Manus Schedule）

**实现方式**：直接在 Manus Schedule 中定义

**数据提取**：
```javascript
// 获取所有套餐按钮
const buttons = document.querySelectorAll('button[hint]');

// 提取 hint 属性
buttons.forEach(btn => {
  const hint = btn.getAttribute('hint');
  // 解析 hint 获取套餐信息
});
```

### 3. `scripts/sync_json.py`（手动运行）

**功能**：从 Supabase 生成 `public/data/esim-packages.json`

**使用场景**：
- 手动更新前端数据
- 数据一致性修复

**运行方法**：
```bash
cd /home/ubuntu/globalpass
export SUPABASE_URL="..."
export SUPABASE_SERVICE_ROLE_KEY="..."
python3 scripts/sync_json.py
```

---

## 📅 运行时间表

| 任务 | 频率 | 运行时间（UTC） | 运行时间（北京） | 平台 |
|------|------|----------------|------------------|------|
| **Nomad 数据更新** | 每天 | 20:00 | 凌晨 4:00 | GitHub Actions |
| **Airalo 数据更新** | 每周日 | 20:30 | 周一凌晨 4:30 | Manus Schedule |

---

## 🚀 部署流程

### 方式 1：通过 Git 推送（推荐用于数据更新）

```bash
cd /home/ubuntu/globalpass

# 1. 更新 JSON 文件
python3 scripts/sync_json.py

# 2. 提交并推送
git add public/data/esim-packages.json
git commit -m "Update: eSIM packages data"
git push github main

# 3. Vercel 自动检测并部署（3-5 分钟）
```

### 方式 2：通过 Manus Checkpoint（用于代码更新）

```bash
# 注意：需要确保代码无构建错误
webdev_save_checkpoint

# 然后在 Management UI 中点击 Publish 按钮
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

**症状**：网站显示未授权国家

**解决方法**：
```bash
# 1. 清理数据库
python3 << 'EOF'
import os, requests, json

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
headers = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}'}

# 加载授权国家
with open('config/countries.json', 'r') as f:
    authorized = set([c['name'] for c in json.load(f)])

# 删除未授权国家
for provider in ['Nomad', 'Airalo']:
    url = f"{SUPABASE_URL}/rest/v1/esim_packages?provider=eq.{provider}&select=country"
    resp = requests.get(url, headers=headers)
    
    for country in set([item['country'] for item in resp.json()]) - authorized:
        del_url = f"{SUPABASE_URL}/rest/v1/esim_packages?provider=eq.{provider}&country=eq.{country}"
        requests.delete(del_url, headers=headers)
EOF

# 2. 重新生成 JSON
python3 scripts/sync_json.py

# 3. 部署更新
git add public/data/esim-packages.json
git commit -m "Fix: Remove unauthorized countries"
git push github main
```

### 问题 3：网站显示旧数据

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
- 💡 建议设置为每周运行（降低成本）

**实施流程**：
1. 先在 GitHub Actions 中测试 Selenium 爬虫
2. 如果遇到反爬或数据提取失败
3. 再改用 Manus Browser Operator
4. 根据积分消耗情况调整运行频率（每天/每周/每月）

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
- Manus Secrets（用于 Manus Schedule）

**凭证内容**：
- `SUPABASE_URL`：https://mzodnvjtlujvvwfnpcyb.supabase.co
- `SUPABASE_SERVICE_ROLE_KEY`：（敏感信息，不在文档中显示）

**安全建议**：
- ✅ 不要在代码中硬编码凭证
- ✅ 使用环境变量
- ✅ 定期轮换 Service Role Key

---

## 📞 联系与支持

**项目维护者**：lihm519

**问题反馈**：
- GitHub Issues：https://github.com/lihm519/globalpass/issues
- Manus 帮助中心：https://help.manus.im

---

**文档版本**：v1.0  
**最后更新**：2026-02-02  
**维护状态**：活跃维护中 ✅
