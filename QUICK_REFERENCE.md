# GlobalPass 快速参考

## 🚀 开发流程（测试后发布）

### 1. 开发新功能

```bash
git checkout dev
# 修改代码...
git add .
git commit -m "feat: 新功能"
git push github dev
```

### 2. 查看预览

访问：https://globalpass-dev-lihm519.vercel.app

### 3. 发布到正式环境

```bash
git checkout main
git merge dev
git push github main
```

正式网站：https://globalpass.vercel.app

---

## 📁 项目结构

```
globalpass/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx           # 首页
│   ├── esim/              # E-SIM 比价
│   └── compatibility/     # 兼容性检测
├── components/            # React 组件
├── lib/                   # 工具函数和配置
│   └── i18n.ts           # 多语言配置
├── public/data/          # 数据文件
│   ├── esim-packages.json # E-SIM 套餐数据
│   └── countries.json     # 国家列表
├── config/               # 爬虫配置
│   └── countries.json    # 爬虫国家配置
└── scripts/              # 自动化脚本
    ├── universal_scraper.py        # 通用爬虫
    └── export_supabase_to_json.py  # 数据导出
```

---

## 🔗 重要链接

| 资源 | URL |
|------|-----|
| GitHub 仓库 | https://github.com/lihm519/globalpass |
| 正式网站 | https://globalpass.vercel.app |
| 测试环境 | https://globalpass-dev-lihm519.vercel.app |
| Vercel Dashboard | https://vercel.com/dashboard |

---

## 📝 常用命令

```bash
# 切换分支
git checkout dev          # 开发分支
git checkout main         # 正式分支

# 同步代码
git pull github dev       # 拉取 dev 分支
git pull github main      # 拉取 main 分支

# 合并分支
git merge dev             # 合并 dev 到当前分支
git merge main            # 合并 main 到当前分支

# 查看状态
git status                # 查看修改状态
git log --oneline -5      # 查看最近 5 次提交
git branch -a             # 查看所有分支

# 安装依赖
pnpm install              # 安装所有依赖

# 本地开发（注意：Manus Preview 当前不可用）
pnpm dev                  # 启动开发服务器（仅在 Vercel 上可用）

# 构建
pnpm build                # 构建生产版本
```

---

## 🤖 自动化任务

### GitHub Actions - 每日数据同步

- **触发时间**：每天北京时间凌晨 4:00
- **功能**：自动抓取最新 E-SIM 套餐数据
- **手动触发**：GitHub → Actions → Daily E-SIM Data Sync → Run workflow

---

## 🌍 多语言支持

当前支持 11 种语言：
- 🇨🇳 简体中文
- 🇺🇸 English
- 🇯🇵 日本語
- 🇰🇷 한국어
- 🇪🇸 Español
- 🇫🇷 Français
- 🇩🇪 Deutsch
- 🇮🇹 Italiano
- 🇵🇹 Português
- 🇷🇺 Русский
- 🇸🇦 العربية

---

## 📚 文档索引

- **README.md** - 项目介绍和功能说明
- **VERCEL_PREVIEW_GUIDE.md** - Vercel Preview 详细使用指南
- **PROJECT_CHECKLIST.md** - 项目检查清单和开发规范
- **PROJECT_STATUS.md** - 项目状态和技术栈
- **GITHUB_SECRETS_SETUP.md** - GitHub Secrets 配置指南
- **QUICK_REFERENCE.md** - 本文件（快速参考）

---

## ⚡ 快速修复

### 问题：预览部署失败

1. 查看 Vercel Dashboard 的部署日志
2. 检查错误信息
3. 修复代码后重新推送

### 问题：数据没有更新

1. 检查 GitHub Actions 是否运行成功
2. 手动触发 Actions workflow
3. 检查 Supabase 连接是否正常

### 问题：分支冲突

```bash
# 解决冲突
git checkout dev
git merge main
# 手动解决冲突文件
git add .
git commit -m "merge: Resolve conflicts"
git push github dev
```

---

## 💡 最佳实践

1. **始终在 dev 分支开发** - 不要直接在 main 分支修改
2. **充分测试后再发布** - 使用预览环境测试所有功能
3. **清晰的提交信息** - 使用 `feat:`, `fix:`, `docs:` 等前缀
4. **定期同步分支** - 保持 dev 和 main 同步
5. **记录待办事项** - 在 todo.md 中记录任务

---

**需要详细信息？查看 VERCEL_PREVIEW_GUIDE.md** 📖
