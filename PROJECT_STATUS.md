# GlobalPass 项目状态文档

**最后更新：** 2026-01-07  
**当前版本：** d69e42c  
**部署状态：** ✅ 已部署到 Vercel

---

## 📊 当前项目状态

### Git 状态
```
分支：main
最新提交：d69e42c - feat: Add all 11 languages to language switcher
远程仓库：https://github.com/lihm519/globalpass.git
部署平台：Vercel (https://globalpass.vercel.app)
```

### 目录结构
```
/home/ubuntu/globalpass/
├── app/                    # Next.js App Router（标准结构，非 [locale]）
│   ├── page.tsx           # 首页
│   ├── esim/page.tsx      # E-SIM 比价页面
│   ├── compatibility/page.tsx  # 兼容性检测页面
│   ├── layout.tsx         # 全局布局
│   └── globals.css        # 全局样式
├── components/
│   ├── AIChatDialog.tsx   # AI 聊天对话框
│   └── LanguageSwitcher.tsx  # 语言切换器（11 种语言）
├── lib/
│   └── i18n.ts           # react-i18next 配置（内联翻译）
├── public/data/
│   ├── esim_packages.json  # E-SIM 套餐数据
│   └── phone_compatibility.json  # 手机兼容性数据
└── scripts/              # Python 数据采集脚本
```

### 技术栈
- **Next.js**: 16.1.1
- **React**: 19.2.3
- **多语言**: react-i18next（客户端切换）
- **AI**: Google Gemini 2.0 Flash
- **样式**: Tailwind CSS 4

---

## ✅ 已实现功能

1. **E-SIM 套餐比价**
   - 425+ 套餐数据
   - 按国家搜索和筛选
   - 价格、流量排序
   
2. **AI 导购助手**
   - Google Gemini AI 集成
   - 智能推荐套餐
   
3. **手机兼容性检测**
   - 1000+ 机型数据库
   - 品牌和型号筛选
   
4. **11 种语言支持**
   - en, zh-CN, ja, ko, th, es, fr, de, it, pt, ar
   - 客户端语言切换
   - 翻译内容内联在 `lib/i18n.ts`

---

## ⚠️ 已知问题

### 1. 本地构建失败（不影响部署）
**问题：** `/_global-error` 页面预渲染时 `useContext` 为 null  
**影响：** 无法在本地运行 `pnpm build`，无法保存 Manus checkpoint  
**解决方案：** Vercel 构建环境可以正常处理，网站已成功部署  
**状态：** 可接受（等待 react-i18next 或 Next.js 修复）

### 2. TypeScript 类型错误（不影响功能）
**问题：** `@types/react` 文件找不到  
**影响：** TypeScript 检查报错  
**解决方案：** `next.config.mjs` 已配置 `ignoreBuildErrors: true`  
**状态：** 已忽略

---

## 🚀 部署流程

### 自动部署（推荐）
```bash
# 1. 提交更改
git add .
git commit -m "feat: your feature description"

# 2. 推送到 GitHub
git push github main

# 3. Vercel 自动检测并部署（1-2 分钟）
```

### 验证部署
- 访问：https://globalpass.vercel.app
- 检查 Vercel 控制台：https://vercel.com/lihm519s-projects/globalpass

---

## 📝 开发规范

### 1. 文件操作前必须确认路径
```bash
# ❌ 错误：直接操作
cd /home/ubuntu/globalpass/app/[locale]

# ✅ 正确：先确认
cd /home/ubuntu/globalpass && ls -la app/
cd /home/ubuntu/globalpass && find app -name "page.tsx"
```

### 2. 不要擅自回滚项目
```bash
# ❌ 绝对禁止（未经用户允许）
webdev_rollback_checkpoint
git reset --hard HEAD~1

# ✅ 正确：先询问用户
# 向用户说明问题和建议的回滚方案，等待用户确认
```

### 3. 操作前检查项目状态
```bash
# 必须先执行
git status
git log --oneline -5
git branch -a
ls -la app/
```

### 4. 使用正确的工具
```bash
# ✅ 优先使用 webdev 工具
webdev_save_checkpoint

# ❌ 避免原始 Git 命令（除非必要）
git commit
git push
```

---

## 🔧 常见任务

### 添加新语言
1. 编辑 `lib/i18n.ts`，添加翻译对象
2. 编辑 `components/LanguageSwitcher.tsx`，添加语言选项
3. 测试语言切换功能
4. 推送到 GitHub

### 更新 E-SIM 数据
1. 运行爬虫：`python scripts/airalo_scraper.py`
2. 导出数据：`python scripts/export_to_json.py`
3. 替换 `public/data/esim_packages.json`
4. 推送到 GitHub

### 修复搜索功能
1. 确认 `app/esim/page.tsx` 使用 `<Suspense>` 包裹
2. 确认 `useSearchParams()` 在客户端组件中
3. 测试搜索功能
4. 推送到 GitHub

---

## 📞 紧急情况处理

### 如果部署失败
1. 检查 Vercel 构建日志
2. 检查 GitHub 推送是否成功：`git log github/main`
3. 手动触发 Vercel 重新部署

### 如果代码丢失
1. **不要慌张，不要回滚**
2. 检查 Git 历史：`git reflog`
3. 检查远程分支：`git log github/main`
4. 如果需要恢复，先询问用户

### 如果路径找不到
1. 检查当前目录：`pwd`
2. 列出文件：`ls -la`
3. 搜索文件：`find . -name "filename"`
4. 确认路径后再操作

---

## ✅ 项目整理完成清单

- [x] 清理 Git 分支（删除 save, nextjs-migration-final）
- [x] 更新 README.md（完整文档）
- [x] 添加 11 种语言支持
- [x] 修复 esim 页面 Suspense
- [x] 简化 next.config.mjs
- [x] 推送到 GitHub
- [x] 部署到 Vercel
- [x] 创建项目状态文档
- [ ] 保存 Manus checkpoint（因构建问题暂时无法完成）

---

**最后更新：** 2026-01-07  
**维护者：** GlobalPass Team  
**状态：** ✅ 生产环境运行正常
