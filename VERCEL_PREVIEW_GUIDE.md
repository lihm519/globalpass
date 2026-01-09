# Vercel Preview 测试环境使用指南

## 📋 概述

GlobalPass 项目使用 **Vercel Preview Deployments** 作为测试环境。每次推送到 `dev` 分支时，Vercel 会自动创建一个预览部署，您可以在独立的 URL 上测试新功能，确认无误后再合并到 `main` 分支发布到正式网站。

---

## 🎯 工作流程

### 1. 开发新功能

```bash
# 切换到 dev 分支
git checkout dev

# 拉取最新代码
git pull github dev

# 修改代码...
# 例如：编辑 app/esim/page.tsx

# 提交更改
git add .
git commit -m "feat: 添加新功能"

# 推送到 GitHub
git push github dev
```

### 2. 自动部署预览

推送后，Vercel 会自动：
1. 检测到 `dev` 分支的更新
2. 开始构建预览版本
3. 部署到预览 URL

**预览 URL 格式：**
```
https://globalpass-dev-lihm519.vercel.app
或
https://globalpass-git-dev-lihm519.vercel.app
```

### 3. 测试预览版本

1. 访问预览 URL
2. 测试所有修改的功能
3. 检查是否有 bug 或问题
4. 如果有问题，返回步骤 1 继续修改

### 4. 发布到正式网站

测试通过后：

```bash
# 切换到 main 分支
git checkout main

# 合并 dev 分支
git merge dev

# 推送到 GitHub
git push github main
```

Vercel 会自动部署到正式网站：`https://globalpass.vercel.app`

---

## 🔍 查看部署状态

### 方法 1：GitHub 仓库页面

1. 访问：https://github.com/lihm519/globalpass
2. 点击 **Commits** 或 **Branches**
3. 找到最新的提交，旁边会显示部署状态：
   - 🟡 **黄色圆点** - 正在部署
   - ✅ **绿色勾** - 部署成功
   - ❌ **红色叉** - 部署失败
4. 点击状态图标可以查看详细信息和预览 URL

### 方法 2：Vercel Dashboard

1. 访问：https://vercel.com/dashboard
2. 找到 **globalpass** 项目
3. 查看 **Deployments** 列表
4. 找到 `dev` 分支的部署记录
5. 点击可以查看详情和访问预览 URL

---

## 📝 常见场景

### 场景 1：修复 Bug

```bash
# 1. 切换到 dev 分支
git checkout dev

# 2. 修复 bug
# 编辑相关文件...

# 3. 提交并推送
git add .
git commit -m "fix: 修复 XXX 问题"
git push github dev

# 4. 等待预览部署完成（通常 1-2 分钟）

# 5. 访问预览 URL 验证修复

# 6. 确认无误后合并到 main
git checkout main
git merge dev
git push github main
```

### 场景 2：添加新功能

```bash
# 1. 切换到 dev 分支
git checkout dev

# 2. 开发新功能
# 创建新文件或修改现有文件...

# 3. 提交并推送
git add .
git commit -m "feat: 添加 XXX 功能"
git push github dev

# 4. 测试预览版本

# 5. 如果需要调整，继续修改并推送
git add .
git commit -m "feat: 优化 XXX 功能"
git push github dev

# 6. 最终测试通过后合并到 main
git checkout main
git merge dev
git push github main
```

### 场景 3：紧急修复（直接在 main 分支）

如果是紧急 bug 需要立即修复：

```bash
# 1. 在 main 分支直接修复
git checkout main
git add .
git commit -m "hotfix: 紧急修复 XXX"
git push github main

# 2. 同步到 dev 分支
git checkout dev
git merge main
git push github dev
```

---

## ⚙️ Vercel 配置

### 自动部署设置

Vercel 默认会为以下情况创建部署：

- ✅ **Production（生产）** - `main` 分支的推送
- ✅ **Preview（预览）** - 其他分支（如 `dev`）的推送
- ✅ **Pull Request（PR）** - 创建 PR 时自动部署预览

### 环境变量

- **生产环境**（main 分支）和**预览环境**（dev 分支）**共享相同的环境变量**
- 如果需要不同的配置，可以在 Vercel Dashboard 中为预览环境单独设置

**当前环境变量：**
- `GOOGLE_GENERATIVE_AI_API_KEY` - Google Gemini API 密钥

---

## 🚨 注意事项

### 1. 预览 URL 是临时的

- 预览 URL 会在新的部署创建后被覆盖
- 不要将预览 URL 分享给长期使用
- 只用于临时测试

### 2. 数据库和 API

- 预览环境和生产环境**共享相同的数据库**
- 测试时注意不要影响生产数据
- 如果需要测试数据库操作，建议使用测试数据

### 3. 分支同步

- 定期将 `main` 分支的更新合并到 `dev` 分支
- 避免 `dev` 分支落后太多导致冲突

```bash
# 同步 main 到 dev
git checkout dev
git merge main
git push github dev
```

### 4. 部署时间

- 预览部署通常需要 **1-3 分钟**
- 如果超过 5 分钟还没完成，检查 Vercel Dashboard 的部署日志

---

## 📊 部署状态说明

| 状态 | 说明 | 操作 |
|------|------|------|
| 🟡 Building | 正在构建 | 等待完成 |
| ✅ Ready | 部署成功 | 可以访问预览 URL |
| ❌ Error | 部署失败 | 查看错误日志，修复后重新推送 |
| ⏸️ Canceled | 被取消 | 通常是因为有新的推送 |

---

## 🔗 相关链接

- **GitHub 仓库**: https://github.com/lihm519/globalpass
- **Vercel Dashboard**: https://vercel.com/dashboard
- **正式网站**: https://globalpass.vercel.app
- **预览网站**: https://globalpass-dev-lihm519.vercel.app

---

## 💡 最佳实践

1. **小步提交** - 每次只修改一个功能，方便测试和回滚
2. **详细的提交信息** - 使用清晰的 commit message
3. **充分测试** - 在预览环境中测试所有功能后再发布
4. **定期同步** - 保持 dev 和 main 分支同步
5. **记录问题** - 在 todo.md 中记录发现的问题和待办事项

---

## ❓ 常见问题

### Q1: 预览 URL 在哪里找？

**A:** 有三种方法：
1. GitHub 提交记录旁边的状态图标
2. Vercel Dashboard 的 Deployments 列表
3. GitHub 仓库的 Environments 页面

### Q2: 预览部署失败了怎么办？

**A:** 
1. 查看 Vercel Dashboard 的部署日志
2. 检查错误信息
3. 修复代码后重新推送
4. 如果无法解决，可以在 GitHub 上查看构建日志

### Q3: 可以同时有多个预览环境吗？

**A:** 可以！每个分支都会有自己的预览 URL：
- `dev` 分支 → `globalpass-dev-xxx.vercel.app`
- `feature-x` 分支 → `globalpass-feature-x-xxx.vercel.app`

### Q4: 预览环境的数据会影响生产环境吗？

**A:** 
- **不会影响网站代码** - 预览和生产是独立部署的
- **会共享数据库** - 如果修改了数据库，两个环境都会受影响
- **建议** - 测试数据库操作时使用测试数据

---

**设置完成！现在您可以使用 `dev` 分支进行测试，确认无误后再发布到正式网站。** 🎉
