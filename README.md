# 🌍 GlobalPass - 全球 E-SIM 比价与手机兼容性检测

GlobalPass 是一个现代化的 E-SIM 比价平台，帮助全球旅行者快速找到最优惠的国际数据套餐，并提供设备兼容性检测功能。

## ✨ 核心功能

- 📱 **手机兼容性检测** - 一键检测您的手机是否支持 E-SIM
- 💰 **全球套餐对比** - 实时对比日本、美国、泰国等国家的 E-SIM 价格
- 🎨 **现代 UI 设计** - 深色主题、玻璃拟态效果、绿色强调色
- 🔐 **安全数据访问** - 使用 Supabase RLS 保护数据

## 🛠️ 技术栈

- **前端框架**: React 19 + TypeScript
- **路由**: Wouter (轻量级客户端路由)
- **样式**: Tailwind CSS 4 + 深色主题
- **UI 组件**: shadcn/ui
- **图标**: Lucide Icons
- **数据库**: Supabase (PostgreSQL)
- **构建工具**: Vite

## 📁 项目结构

```
globalpass/
├── client/                          # 前端应用
│   ├── public/                      # 静态资源
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx            # 首页
│   │   │   ├── ESIMPage.tsx        # E-SIM 比价页面
│   │   │   └── NotFound.tsx        # 404 页面
│   │   ├── components/             # UI 组件
│   │   ├── data/
│   │   │   └── esim-data.ts        # E-SIM 数据配置
│   │   ├── App.tsx                 # 路由配置
│   │   ├── main.tsx                # React 入口
│   │   └── index.css               # 全局样式
│   └── index.html
├── scripts/
│   ├── init_db_supabase.py         # Python 数据库初始化脚本
│   └── init_database.sql           # SQL 初始化脚本
├── DATABASE_SETUP.md               # 数据库配置指南
├── package.json
└── README.md
```

## 🚀 快速开始

### 本地开发

1. **安装依赖**：
   ```bash
   pnpm install
   ```

2. **启动开发服务器**：
   ```bash
   pnpm dev
   ```

3. **访问应用**：
   - 打开浏览器访问 `http://localhost:3000`

### 数据库配置

详见 [DATABASE_SETUP.md](./DATABASE_SETUP.md)

## 📱 页面说明

### 首页 (`/`)
- 项目介绍和功能说明
- 三个特性卡片展示
- 导航按钮进入 E-SIM 应用

### E-SIM 页面 (`/esim`)
- **手机检测器**：下拉选择手机型号，显示 E-SIM 支持状态
- **热门套餐**：
  - 国家选择标签（日本、美国、泰国）
  - 套餐卡片展示（数据量、价格、购买链接）
  - 玻璃拟态效果设计

## 🎨 设计特点

- **深色主题**：深蓝色背景 (slate-950/900)
- **绿色强调色**：翠绿色 (emerald-500) 用于按钮和交互元素
- **玻璃拟态效果**：半透明卡片 + 模糊背景
- **响应式设计**：支持移动端、平板和桌面
- **现代交互**：平滑过渡、悬停效果、清晰反馈

## 📊 数据结构

### esim_packages 表
```sql
- id: BIGSERIAL (主键)
- country: VARCHAR (国家名称)
- data_amount: VARCHAR (数据量，如 "1GB")
- price: DECIMAL (价格)
- provider: VARCHAR (提供商名称)
- affiliate_link: TEXT (购买链接)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### supported_devices 表
```sql
- id: BIGSERIAL (主键)
- brand: VARCHAR (品牌，如 "Apple")
- model: VARCHAR (型号，如 "iPhone 14")
- is_supported: BOOLEAN (是否支持 E-SIM)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## 🔐 安全性

- 使用 Supabase RLS (Row Level Security) 保护数据
- 所有表都配置了允许公开读取的策略
- 敏感信息通过环境变量管理

## 📝 环境变量

```bash
# .env.local
VITE_SUPABASE_URL=https://mzodnvjtlujvvwfnpcyb.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 🔄 数据更新

### 添加新国家

编辑 `client/src/data/esim-data.ts`：

```typescript
{
  id: "sg-1gb",
  country: "Singapore",
  countryCode: "SG",
  dataAmount: "1GB",
  price: 4.49,
  provider: "Airalo",
  affiliateLink: "https://airalo.com/singapore",
}
```

### 添加新设备

编辑 `client/src/data/esim-data.ts`：

```typescript
{
  id: "samsung-s25",
  brand: "Samsung",
  model: "Galaxy S25",
  isSupported: true,
}
```

## 📦 构建和部署

### 构建生产版本
```bash
pnpm build
```

### 预览生产版本
```bash
pnpm preview
```

## 🐛 故障排除

### 页面加载失败
- 检查浏览器控制台错误信息
- 确保数据库连接正确
- 验证环境变量配置

### 数据不显示
- 检查 Supabase 数据库是否有数据
- 验证 RLS 策略是否允许读取
- 检查 API 密钥是否正确

## 📚 相关文档

- [Supabase 文档](https://supabase.com/docs)
- [React 文档](https://react.dev)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Wouter 文档](https://github.com/molefrog/wouter)

## 📞 支持

- 📧 Email: support@globalpass.com
- 💬 WeChat: GlobalPass_Support

## 📄 许可证

MIT License

## 🙏 致谢

感谢 Supabase、React、Tailwind CSS 等开源项目的支持。

---

**版本**: 1.0.0  
**最后更新**: 2024 年 1 月  
**状态**: 开发中 ✨
