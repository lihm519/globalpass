/**
 * Supabase 客户端配置
 * 用于连接 GlobalPass 数据库
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mzodnvjtlujvvwfnpcyb.supabase.co";
// 使用公开的 anon key（用于客户端）
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16b2Rudmp0bHVqdnZ3Zm5wY3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NDA5ODYsImV4cCI6MjA4MzExNjk4Nn0.U35kFZAv-yjOUQimuoQCN18WjUS4biBQ1h7iI7rlQpc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 类型定义
export interface ESIMPackage {
  id: number;
  country: string;
  data_amount: string;
  price: number;
  provider: string;
  affiliate_link: string;
  created_at: string;
  updated_at: string;
}

export interface SupportedDevice {
  id: number;
  brand: string;
  model: string;
  is_supported: boolean;
  created_at: string;
  updated_at: string;
}

// 获取所有 E-SIM 套餐
export async function getESIMPackages() {
  try {
    const { data, error } = await supabase
      .from("esim_packages")
      .select("*")
      .order("country", { ascending: true })
      .order("price", { ascending: true });

    if (error) {
      console.error("获取 E-SIM 套餐失败:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("获取 E-SIM 套餐异常:", err);
    return [];
  }
}

// 获取特定国家的套餐
export async function getPackagesByCountry(country: string) {
  try {
    const { data, error } = await supabase
      .from("esim_packages")
      .select("*")
      .eq("country", country)
      .order("price", { ascending: true });

    if (error) {
      console.error(`获取 ${country} 套餐失败:`, error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error(`获取 ${country} 套餐异常:`, err);
    return [];
  }
}

// 获取所有国家列表
export async function getCountries() {
  try {
    const { data, error } = await supabase
      .from("esim_packages")
      .select("country")
      .order("country", { ascending: true });

    if (error) {
      console.error("获取国家列表失败:", error);
      return [];
    }

    // 去重
    const countries = Array.from(
      new Set((data || []).map((item: any) => item.country))
    );
    return countries;
  } catch (err) {
    console.error("获取国家列表异常:", err);
    return [];
  }
}

// 获取所有支持的设备
export async function getSupportedDevices() {
  try {
    const { data, error } = await supabase
      .from("supported_devices")
      .select("*")
      .order("brand", { ascending: true })
      .order("model", { ascending: true });

    if (error) {
      console.error("获取设备列表失败:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("获取设备列表异常:", err);
    return [];
  }
}

// 检查设备是否支持 E-SIM
export async function isDeviceSupported(
  brand: string,
  model: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("supported_devices")
      .select("is_supported")
      .eq("brand", brand)
      .eq("model", model)
      .single();

    if (error) {
      console.error("检查设备支持状态失败:", error);
      return false;
    }

    return data?.is_supported || false;
  } catch (err) {
    console.error("检查设备支持状态异常:", err);
    return false;
  }
}
