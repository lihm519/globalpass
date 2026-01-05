#!/usr/bin/env python3
"""
GlobalPass - 最终数据库架构执行脚本
阶段一：数据库终极封板
"""

import requests
import json
from pathlib import Path

# Supabase 配置
SUPABASE_URL = "https://mzodnvjtlujvvwfnpcyb.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16b2Rudmp0bHVqdnZ3Zm5wY3liIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0MDk4NiwiZXhwIjoyMDgzMTE2OTg2fQ.gr-5J22EhV08PLghNcoS8o5lUFjaEyby21MwE-35ENs"

def execute_sql(sql_script):
    """通过 Supabase REST API 执行 SQL 脚本"""
    print("\n" + "=" * 70)
    print("🗄️  执行最终数据库架构初始化")
    print("=" * 70)
    
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }
    
    # 将 SQL 脚本分割成单个语句
    statements = [s.strip() for s in sql_script.split(';') if s.strip()]
    
    success_count = 0
    error_count = 0
    
    for i, statement in enumerate(statements, 1):
        # 跳过注释和空语句
        if statement.startswith('--') or not statement.strip():
            continue
        
        try:
            # 使用 Supabase RPC 执行 SQL
            url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
            
            # 由于 Supabase 不支持直接 SQL 执行，我们需要使用另一种方法
            # 这里使用 PostgreSQL 连接字符串直接连接
            print(f"\n📝 执行语句 {i}/{len(statements)}...")
            print(f"   {statement[:60]}...")
            
            # 注：此方法需要 psycopg2 库和直接 PostgreSQL 连接
            # 由于 sandbox 网络限制，我们将输出 SQL 供用户在 Supabase 控制台执行
            
        except Exception as e:
            print(f"❌ 错误: {str(e)[:100]}")
            error_count += 1
    
    return success_count, error_count

def main():
    print("\n" + "=" * 70)
    print("🌍 GlobalPass - 最终数据库架构执行")
    print("=" * 70)
    
    # 读取 SQL 脚本
    sql_file = Path(__file__).parent / "final_database_schema.sql"
    
    if not sql_file.exists():
        print(f"❌ SQL 文件不存在: {sql_file}")
        return 1
    
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_script = f.read()
    
    print(f"\n📄 已读取 SQL 脚本 ({len(sql_script)} 字符)")
    
    # 输出说明
    print("\n" + "=" * 70)
    print("⚠️  重要说明")
    print("=" * 70)
    print("""
由于 sandbox 网络限制，无法直接连接 PostgreSQL。

请按以下步骤在 Supabase 控制台手动执行：

1. 打开 Supabase 控制台 → SQL Editor
2. 新建查询，复制以下 SQL 脚本
3. 点击 Run 执行

SQL 脚本已保存在：scripts/final_database_schema.sql
    """)
    
    # 输出 SQL 脚本
    print("\n" + "=" * 70)
    print("📋 SQL 脚本内容")
    print("=" * 70)
    print(sql_script)
    
    print("\n" + "=" * 70)
    print("✅ SQL 脚本已准备好")
    print("=" * 70)
    print("""
执行完毕后，您将看到：
✓ esim_packages 表已创建（新架构）
✓ supported_devices 表已创建（v1.2）
✓ RLS 策略已配置
✓ 初始设备数据已插入
✓ 索引已创建

然后运行以下命令验证：
  SELECT COUNT(*) FROM esim_packages;
  SELECT COUNT(*) FROM supported_devices;
    """)
    
    return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())
