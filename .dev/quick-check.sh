#!/bin/bash
# GlobalPass 项目快速检查脚本
# 用于新会话启动时快速验证项目状态

echo "🔍 GlobalPass 项目快速检查"
echo "======================================"
echo ""

cd /home/ubuntu/globalpass

# 1. 检查关键文件
echo "📁 关键文件检查："
for file in "app/page.tsx" "app/layout.tsx" "app/esim/page.tsx" "app/compatibility/page.tsx" "components/LanguageSwitcher.tsx" "components/AIChatDialog.tsx" "lib/i18n.ts" "public/data/esim-packages.json"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file 不存在！"
  fi
done

# 2. 检查错误目录
echo ""
echo "🚫 错误目录检查："
if [ -d "app/[locale]" ]; then
  echo "  ❌ 发现 app/[locale] 目录（应该删除）"
else
  echo "  ✅ 没有错误的 [locale] 目录"
fi

if [ -d "venv" ]; then
  echo "  ❌ 发现 venv 目录（应该删除）"
else
  echo "  ✅ 没有 venv 目录"
fi

if ls *_backup 2>/dev/null; then
  echo "  ❌ 发现备份目录（应该删除）"
else
  echo "  ✅ 没有备份目录"
fi

# 3. Git 状态
echo ""
echo "📊 Git 状态："
echo "  当前分支: $(git branch --show-current)"
echo "  最新提交: $(git log --oneline -1)"
echo "  未提交更改: $(git status --short | wc -l) 个文件"

# 4. 数据文件
echo ""
echo "📦 数据文件："
if [ -f "public/data/esim-packages.json" ]; then
  size=$(du -h public/data/esim-packages.json | cut -f1)
  echo "  ✅ esim-packages.json ($size)"
else
  echo "  ❌ esim-packages.json 不存在"
fi

# 5. 配置文件
echo ""
echo "⚙️  配置文件："
if grep -q '"build": "next build"' package.json; then
  echo "  ✅ package.json 构建命令正确"
else
  echo "  ❌ package.json 构建命令错误"
fi

if grep -q 'ignoreBuildErrors: true' next.config.mjs; then
  echo "  ✅ next.config.mjs 配置正确"
else
  echo "  ⚠️  next.config.mjs 可能需要检查"
fi

# 6. 总结
echo ""
echo "======================================"
echo "✅ 检查完成！"
echo ""
echo "📚 相关文档："
echo "  - PROJECT_CHECKLIST.md  (完整检查清单)"
echo "  - PROJECT_STATUS.md     (项目状态)"
echo "  - README.md             (项目介绍)"
echo ""
echo "🚀 准备就绪，可以开始工作！"
