"""
Supabase 客户端配置
"""

from supabase import create_client, Client

# Supabase 配置
SUPABASE_URL = "https://mzodnvjtlujvvwfnpcyb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16b2Rudnp0bHVqdnZ3Zm5wY3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5NzE3MDAsImV4cCI6MjA1MTU0NzcwMH0.Gy1-K1nDgJOXZzGVOOjnxVsQPyXdZzZFqtI0pPWZTyM"

# 创建 Supabase 客户端
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
