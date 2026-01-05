# GlobalPass Phase 3 TODO

## Phase 3 - 前端交互升级 + Gemini AI 导购

### 后端开发
- [x] 安装 @google/generative-ai 依赖
- [x] 创建 Gemini AI 客户端配置
- [x] 创建 tRPC 路由 `chat.ask` 用于 AI 导购
- [x] 实现 RAG 检索：查询数据库获取相关套餐
- [x] 实现 Gemini 生成回答

### 前端交互优化
- [x] 添加即时搜索框（Real-time Search）
- [x] 添加热门推荐区域（Popular Destinations）
- [x] 添加筛选器（按流量、有效期）
- [x] 优化比价卡片布局（价格从低到高）
- [x] 视觉区分 Airalo 和 Nomad（Logo/颜色标签）
- [x] 无限流量套餐高亮显示（金色/紫色边框）

### AI 导购集成
- [x] 创建 AI 聊天组件
- [x] 集成到 E-SIM 页面
- [ ] 实现流式响应显示（可选）
- [x] 测试 AI 推荐功能

### 测试与部署
- [x] 本地测试所有功能
- [ ] 推送到 GitHub
- [ ] 验证 GitHub Actions 工作流
- [ ] 创建最终 Checkpoint
