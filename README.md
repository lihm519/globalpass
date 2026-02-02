# GlobalPass - 全球 E-SIM 比价与手机兼容性检测

**GlobalPass** 是一个全球 E-SIM 套餐比价平台，帮助用户找到最适合的国际漫游方案，并检测手机是否支持 E-SIM 技术。

🌐 **在线访问：** https://globalpass.vercel.app

---

## ✨ 核心功能

### 1. 📊 E-SIM 套餐比价
- **425+ 套餐数据**：覆盖 20+ 个国家和地区
- **实时比价**：按国家、流量、有效期筛选
- **智能排序**：价格、流量多维度排序
- **一键购买**：直达供应商官网

### 2. 🤖 AI 导购助手
- **智能推荐**：基于 Google Gemini AI
- **自然对话**：理解用户需求
- **个性化方案**：根据旅行计划推荐最佳套餐

### 3. 📱 手机兼容性检测
- **1000+ 机型数据库**：覆盖主流品牌
- **一键检测**：选择品牌和型号即可查询
- **详细信息**：E-SIM 支持状态、激活方式

### 4. 🌍 11 种语言支持
- 🇬🇧 English
- 🇨🇳 简体中文
- 🇯🇵 日本語
- 🇰🇷 한국어
- 🇹🇭 ไทย
- 🇪🇸 Español
- 🇫🇷 Français
- 🇩🇪 Deutsch
- 🇮🇹 Italiano
- 🇵🇹 Português
- 🇸🇦 العربية

---

## 🛠️ 技术栈

### 前端
- **框架**：Next.js 16.1.1（App Router）
- **UI 库**：React 19.2.3
- **样式**：Tailwind CSS 4
- **多语言**：react-i18next
- **图标**：lucide-react

### 后端 & AI
- **AI 模型**：Google Gemini 2.0 Flash
- **API**：Next.js API Routes
- **数据存储**：JSON 文件（静态数据）

### 部署
- **托管平台**：Vercel
- **CI/CD**：GitHub Actions（自动部署）
- **域名**：globalpass.vercel.app

---

## 📁 项目结构

```
globalpass/
├── app/                      # Next.js App Router
│   ├── page.tsx             # 首页
│   ├── esim/                # E-SIM 比价页面
│   │   └── page.tsx
│   ├── compatibility/       # 兼容性检测页面
│   │   └── page.tsx
│   ├── layout.tsx           # 全局布局
│   └── globals.css          # 全局样式
├── components/              # React 组件
│   ├── AIChatDialog.tsx    # AI 聊天对话框
│   └── LanguageSwitcher.tsx # 语言切换器
├── lib/                     # 工具库
│   └── i18n.ts             # 多语言配置（11 种语言）
├── public/                  # 静态资源
│   └── data/               # 数据文件
│       ├── esim_packages.json      # E-SIM 套餐数据
│       └── phone_compatibility.json # 手机兼容性数据
├── scripts/                 # 数据采集脚本
│   ├── airalo_scraper.py   # Airalo 数据爬虫
│   └── export_to_json.py   # 数据导出脚本
└── README.md               # 项目文档
```

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/lihm519/globalpass.git
cd globalpass
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

创建 `.env.local` 文件：

```env
# Google Gemini AI API Key
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

### 5. 构建生产版本

```bash
pnpm build
pnpm start
```

---

## 📊 数据更新

### E-SIM 套餐数据

数据文件：`public/data/esim_packages.json`

**手动更新：**
1. 运行爬虫脚本：`python scripts/airalo_scraper.py`
2. 导出数据：`python scripts/export_to_json.py`
3. 替换 `esim_packages.json`

**自动更新：**
- 使用 GitHub Actions 定时任务（每日更新）

### 手机兼容性数据

数据文件：`public/data/phone_compatibility.json`

**更新方式：**
- 手动编辑 JSON 文件
- 或使用数据库导出脚本

---

## 🌐 多语言支持

### 添加新语言

1. 编辑 `lib/i18n.ts`
2. 添加新语言的翻译对象
3. 更新 `components/LanguageSwitcher.tsx` 的语言列表

示例：

```typescript
// lib/i18n.ts
const resources = {
  // ... 现有语言
  'new-lang': {
    translation: {
      home: 'Home',
      // ... 其他翻译
    },
  },
};

// components/LanguageSwitcher.tsx
const languages = [
  // ... 现有语言
  { code: 'new-lang', name: 'New Language', flag: '🏳️' },
];
```

---

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 贡献流程

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送到分支：`git push origin feature/your-feature`
5. 提交 Pull Request

### 代码规范

- 使用 ESLint 和 Prettier
- 遵循 React 和 Next.js 最佳实践
- 提交信息使用 Conventional Commits 格式

---

## 📝 开发日志

### v1.0.0 (2026-01-07)
- ✅ 首页设计与实现
- ✅ E-SIM 套餐比价功能
- ✅ AI 导购助手集成
- ✅ 手机兼容性检测
- ✅ 11 种语言支持
- ✅ 搜索功能优化
- ✅ Vercel 部署

---

## 📄 许可证

MIT License

---

## 📧 联系方式

- **项目地址**：https://github.com/lihm519/globalpass
- **在线访问**：https://globalpass.vercel.app
- **问题反馈**：https://github.com/lihm519/globalpass/issues

---

## 🙏 致谢

- **数据来源**：Airalo, eSIM Go 等 E-SIM 供应商
- **AI 支持**：Google Gemini
- **部署平台**：Vercel
- **UI 灵感**：Tailwind CSS 社区

---

**Made with ❤️ by GlobalPass Team**
