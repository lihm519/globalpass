# GlobalPass 完整功能开发任务

## Phase 1: 多语言支持
- [x] 安装 react-i18next
- [x] 创建翻译文件（3种语言：英文、中文、日文）
- [x] 创建语言切换器组件
- [x] 在首页添加语言切换器

## Phase 2: E-SIM 比价页面
- [x] 创建 /esim 页面
- [x] 实现国家选择下拉框
- [x] 实现套餐列表展示
- [x] 添加购买链接（跳转到 provider 官网）
- [ ] 添加筛选功能（按流量、价格、有效期）
- [ ] 添加排序功能

## Phase 3: AI 导购助手
- [x] 创建 AI 对话框组件
- [x] 集成 Google Gemini API
- [x] 实现智能推荐逻辑
- [x] 在首页添加 AI 按钮（浮动按钮 + 特性卡片）

## Phase 4: 手机兼容性检测
- [x] 创建 /compatibility 页面
- [x] 实现手机品牌/型号选择（5个品牌，80+型号）
- [x] 显示兼容性结果
- [x] 添加 E-SIM 支持说明

## Phase 5: 导航和布局
- [x] 创建全局导航栏
- [x] 添加页面路由
- [ ] 优化移动端响应式设计

## Phase 6: 测试和部署
- [x] 测试所有功能
- [x] 推送到 GitHub
- [x] 验证 Vercel 部署

## 紧急修复：AI 功能
- [x] 检查 Google Gemini API 端点
- [x] 修复 API 请求格式（将 API Key 放在 URL 参数中）
- [x] 添加详细错误日志
- [x] 更新模型名称（gemini-pro → gemini-1.5-flash）
- [ ] 测试 API 调用
- [x] 部署修复

## 切换到 Google 官方 SDK
- [x] 安装 @google/generative-ai (v0.24.1)
- [x] 重写 AIChatDialog 使用 SDK
- [ ] 测试 API 调用
- [ ] 推送部署

## 使用新 API Key 修复 AI
- [x] 更新本地 .env.local 文件
- [x] 增强 SDK 调试日志（API Key 检查）
- [ ] 推送部署
- [ ] 提醒用户更新 Vercel 环境变量

## 恢复之前可用的 AI 配置
- [ ] 检查 Git 历史中的 AI 代码
- [ ] 找到之前可用的版本
- [ ] 恢复可用的配置
- [ ] 测试并部署

## Preview & Testing Environment

- [x] 诊断 Manus Preview 问题（Turbopack 文件限制）
- [x] 决定使用 Vercel Preview 作为测试环境
- [x] 创建 dev 分支用于 Vercel Preview
- [x] 配置 Vercel Preview 自动部署
- [x] 编写 Vercel Preview 使用文档
- [ ] 验证 Vercel Preview 自动部署

## Impact 网站验证
- [x] 添加 Impact 验证代码到 HTML head 标签
- [x] 测试验证代码是否正确显示
- [x] 推送到 GitHub（Vercel 自动部署）

## GEO 深度优化 Phase 1.5 (2026-02-03)

### P0 级任务
- [x] 在 app/layout.tsx 注入 Organization Schema（实体消歧）
- [x] 添加 sameAs 属性（LinkedIn/Twitter/GitHub 链接）
- [x] 添加 knowsAbout 属性（eSIM, International Data Plans, Travel Connectivity）

### P1 级任务
- [x] 创建 public/llms.txt 文件（AI 爬虫路标）
- [x] 列出核心页面路由和说明

### P2 级任务
- [x] E-SIM 列表页添加隐藏的 HTML 表格供 AI 抓取
- [x] 在 app/esim/page.tsx 底部添加 FAQ 组件
- [x] 自动生成 FAQPage Schema

### 部署验证
- [x] 推送到 GitHub 并部署
- [x] Google 富媒体测试验证 Organization Schema（检测到 2 项有效内容）
- [x] 验证 llms.txt 可访问（成功访问）
- [x] 验证隐藏表格是否正常渲染（成功渲染）
- [x] 验证 FAQ Schema（检测到 1 项有效内容）

## Product Schema Offers 字段修复 (2026-02-03)

### 问题描述
- Google 富媒体测试检测到 355 项 "商家信息" 错误
- 原因：Product Schema 的 offers 字段缺少必需的 seller 属性

### 修复任务
- [x] 分析 offers 字段错误原因
- [x] 在 app/esim/page.tsx 中添加 seller 属性
- [x] seller 指向 pkg.provider（Airalo 或 Nomad）
- [x] 推送到 GitHub 并部署（commit 4e33cac）
- [x] 验证修复效果（355 个产品的 seller 属性已成功添加）

## Product Schema 策略调整 (2026-02-03)

### 问题根源
- GlobalPass 是比价平台，不是直接销售商
- 使用了 Merchant Listing 类型的 Product Schema（要求必须是卖家）
- Google 检测到 355 个不符合要求的 Merchant Listing

### 解决方案：方案 1 - 移除单独产品的 Product Schema
- [x] 移除 app/esim/page.tsx 中为每个产品生成的 Product Schema
- [x] 保留 app/layout.tsx 中的聚合 Product Schema
- [ ] 推送到 GitHub 并部署
- [ ] 验证 Google 富媒体测试不再显示 Merchant Listing 错误
