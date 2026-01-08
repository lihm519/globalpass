# GitHub Secrets 配置指南

## 📋 需要配置的 Secrets

为了让 GitHub Actions 自动爬虫正常工作，您需要在 GitHub 仓库中配置以下 Secrets：

### 1. SUPABASE_URL
**值：** `https://mzodnvjtlujvvwfnpcyb.supabase.co`

### 2. SUPABASE_SERVICE_ROLE_KEY
**值：** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16b2Rudmp0bHVqdnZ3Zm5wY3liIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0MDk4NiwiZXhwIjoyMDgzMTE2OTg2fQ.gr-5J22EhV08PLghNcoS8o5lUFjaEyby21MwE-35ENs`

---

## 🔧 配置步骤

### 方法 1：通过 GitHub 网页界面配置

1. **访问仓库设置**
   - 打开：https://github.com/lihm519/globalpass
   - 点击顶部导航栏的 **Settings**（设置）

2. **进入 Secrets 页面**
   - 在左侧菜单找到 **Secrets and variables** → **Actions**
   - 点击进入

3. **添加第一个 Secret**
   - 点击 **New repository secret** 按钮
   - **Name**: 输入 `SUPABASE_URL`
   - **Secret**: 输入 `https://mzodnvjtlujvvwfnpcyb.supabase.co`
   - 点击 **Add secret** 保存

4. **添加第二个 Secret**
   - 再次点击 **New repository secret** 按钮
   - **Name**: 输入 `SUPABASE_SERVICE_ROLE_KEY`
   - **Secret**: 输入完整的 JWT token（见上方）
   - 点击 **Add secret** 保存

5. **验证配置**
   - 确认两个 Secrets 都显示在列表中
   - 注意：Secret 的值不会显示，只会显示名称

---

### 方法 2：通过 GitHub CLI 配置（如果您安装了 gh CLI）

```bash
# 配置 SUPABASE_URL
gh secret set SUPABASE_URL --body "https://mzodnvjtlujvvwfnpcyb.supabase.co" --repo lihm519/globalpass

# 配置 SUPABASE_SERVICE_ROLE_KEY
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16b2Rudmp0bHVqdnZ3Zm5wY3liIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0MDk4NiwiZXhwIjoyMDgzMTE2OTg2fQ.gr-5J22EhV08PLghNcoS8o5lUFjaEyby21MwE-35ENs" --repo lihm519/globalpass
```

---

## ✅ 验证配置

配置完成后，您可以：

### 1. 手动触发 Workflow 测试
- 访问：https://github.com/lihm519/globalpass/actions
- 找到 "Daily E-SIM Data Sync" workflow
- 点击右侧的 **Run workflow** 按钮
- 选择 `main` 分支
- 点击 **Run workflow** 开始测试

### 2. 查看运行日志
- 等待 1-2 分钟
- 点击运行的任务查看详细日志
- 如果成功，应该看到：
  - ✅ 爬虫成功抓取数据
  - ✅ 数据成功导出到 JSON
  - ✅ 文件自动提交到 Git

### 3. 检查数据更新
- 查看 `public/data/esim-packages.json` 文件
- 确认 `timestamp` 字段已更新
- 确认套餐数据正确

---

## 🔒 安全说明

**重要：** 这些 Secrets 包含敏感信息（数据库访问密钥），请：

1. ✅ **不要**将 Secrets 提交到 Git 仓库
2. ✅ **不要**在公开场合分享
3. ✅ **不要**在代码中硬编码（已修复为使用环境变量）
4. ✅ GitHub Secrets 是加密存储的，只有 GitHub Actions 可以访问

---

## 📅 自动运行时间

配置完成后，Workflow 将：

- **每天北京时间凌晨 4:00** 自动运行
- **自动抓取**最新的 E-SIM 套餐数据
- **自动更新** `public/data/esim-packages.json` 文件
- **自动提交**到 Git 仓库
- **Vercel 自动部署**最新数据到网站

---

## 🆘 如果配置后仍然失败

1. **检查 Secret 名称**
   - 必须完全匹配：`SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY`
   - 注意大小写

2. **检查 Secret 值**
   - 确保没有多余的空格
   - 确保 JWT token 完整复制

3. **查看详细日志**
   - 访问 GitHub Actions 页面
   - 点击失败的任务
   - 展开每个步骤查看错误信息

4. **联系支持**
   - 如果问题仍然存在，请提供错误日志截图

---

**配置完成后，请告知我，我会帮您测试验证！** ✅
