/**
 * E-SIM 套餐数据库查询辅助函数
 * 用于 AI 导购的 RAG 检索
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mzodnvjtlujvvwfnpcyb.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16b2Rudmp0bHVqdnZ3Zm5wY3liIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0MDk4NiwiZXhwIjoyMDgzMTE2OTg2fQ.gr-5J22EhV08PLghNcoS8o5lUFjaEyby21MwE-35ENs";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

export interface ESIMPackage {
  id: number;
  country: string;
  provider: string;
  plan_name: string;
  data_type: string;
  data_amount: string;
  validity: string;
  price: number;
  network: string;
  link: string;
  last_checked: string;
}

/**
 * 获取特定国家的最低价套餐（Top N）
 */
export async function getCheapestPackagesByCountry(
  country: string,
  limit: number = 5
): Promise<ESIMPackage[]> {
  try {
    const { data, error } = await supabase
      .from("esim_packages")
      .select("*")
      .eq("country", country)
      .order("price", { ascending: true })
      .limit(limit);

    if (error) {
      console.error(`[DB] Error fetching packages for ${country}:`, error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error(`[DB] Exception fetching packages for ${country}:`, err);
    return [];
  }
}

/**
 * 获取所有国家的最低价套餐（Top N per country）
 */
export async function getAllCheapestPackages(
  limit: number = 3
): Promise<ESIMPackage[]> {
  try {
    const { data, error } = await supabase
      .from("esim_packages")
      .select("*")
      .order("country", { ascending: true })
      .order("price", { ascending: true });

    if (error) {
      console.error("[DB] Error fetching all packages:", error);
      return [];
    }

    // 按国家分组，每个国家取前 N 个最便宜的
    const packagesByCountry = new Map<string, ESIMPackage[]>();
    
    for (const pkg of data || []) {
      const country = pkg.country;
      if (!packagesByCountry.has(country)) {
        packagesByCountry.set(country, []);
      }
      
      const countryPackages = packagesByCountry.get(country)!;
      if (countryPackages.length < limit) {
        countryPackages.push(pkg as ESIMPackage);
      }
    }

    // 展平结果
    const result: ESIMPackage[] = [];
    packagesByCountry.forEach((packages) => {
      result.push(...packages);
    });

    return result;
  } catch (err) {
    console.error("[DB] Exception fetching all packages:", err);
    return [];
  }
}

/**
 * 搜索套餐（按国家名称、提供商等）
 */
export async function searchPackages(
  query: string,
  limit: number = 10
): Promise<ESIMPackage[]> {
  try {
    const { data, error } = await supabase
      .from("esim_packages")
      .select("*")
      .or(`country.ilike.%${query}%,provider.ilike.%${query}%`)
      .order("price", { ascending: true })
      .limit(limit);

    if (error) {
      console.error(`[DB] Error searching packages for "${query}":`, error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error(`[DB] Exception searching packages for "${query}":`, err);
    return [];
  }
}

/**
 * 获取无限流量套餐
 */
export async function getUnlimitedPackages(
  limit: number = 10
): Promise<ESIMPackage[]> {
  try {
    const { data, error } = await supabase
      .from("esim_packages")
      .select("*")
      .eq("data_type", "Unlimited")
      .order("price", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("[DB] Error fetching unlimited packages:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("[DB] Exception fetching unlimited packages:", err);
    return [];
  }
}

/**
 * 格式化套餐数据为 AI 可读的文本
 */
export function formatPackagesForAI(packages: ESIMPackage[]): string {
  if (packages.length === 0) {
    return "暂无相关套餐数据。";
  }

  const lines = packages.map((pkg, index) => {
    return `${index + 1}. ${pkg.country} - ${pkg.provider}
   套餐名称: ${pkg.plan_name}
   数据类型: ${pkg.data_type}
   数据量: ${pkg.data_amount}
   有效期: ${pkg.validity}
   价格: $${pkg.price}
   网络: ${pkg.network}`;
  });

  return `以下是相关的 E-SIM 套餐数据：\n\n${lines.join("\n\n")}`;
}
