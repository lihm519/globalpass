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

## Phase 4: 扩展到热门 20 个国家

### 国家列表研究
- [x] 研究 Airalo 和 Nomad 支持的国家
- [x] 选择热门 20 个国家（基于旅游热度）

### 配置更新
- [x] 更新 config/countries.json
- [ ] 验证国家 slug 正确性

### 测试与部署
- [x] 本地测试部分国家爬取
- [x] 修复 Nomad 爬虫 (SGD 货币支持)
- [x] 推送到 GitHub 触发全量爬取
- [x] 验证数据库数据完整性 (282 个套餐, 19 个国家)
- [x] 验证前端显示效果
- [ ] 创建 Checkpoint
