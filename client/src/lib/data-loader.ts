/**
 * GlobalPass 数据加载库
 * 从本地静态 JSON 文件加载数据（每日自动更新）
 * 相比直接查询 Supabase，这种方式更快更稳定
 */

export interface ESIMPackage {
  id: number;
  country: string;
  data_amount: string;
  price: number;
  provider: string;
  plan_name: string;
  data_type: string;
  validity?: string;
  network: string;
  link: string;
  last_checked: string;
}

export interface ESIMData {
  timestamp: string;
  total_packages: number;
  countries: string[];
  packages: Record<string, ESIMPackage[]>;
  all_packages: ESIMPackage[];
}

export interface CountriesData {
  timestamp: string;
  countries: string[];
  count: number;
}

// 缓存数据
let cachedPackagesData: ESIMData | null = null;
let cachedCountriesData: CountriesData | null = null;
let loadPromise: Promise<ESIMData> | null = null;

/**
 * 加载 E-SIM 套餐数据
 */
export async function loadPackagesData(): Promise<ESIMData> {
  // 如果已缓存，直接返回
  if (cachedPackagesData) {
    return cachedPackagesData;
  }

  // 如果正在加载，等待现有的加载完成
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      const response = await fetch("/data/esim-packages.json");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      cachedPackagesData = await response.json();
      return cachedPackagesData!;
    } catch (err) {
      console.error("加载 E-SIM 套餐数据失败:", err);
      // 返回空数据结构作为备用
      return {
        timestamp: new Date().toISOString(),
        total_packages: 0,
        countries: [],
        packages: {},
        all_packages: [],
      };
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

/**
 * 加载国家列表
 */
export async function loadCountriesData(): Promise<CountriesData> {
  if (cachedCountriesData) {
    return cachedCountriesData;
  }

  try {
    const response = await fetch("/data/countries.json");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    cachedCountriesData = await response.json();
    return cachedCountriesData!
  } catch (err) {
    console.error("加载国家列表失败:", err);
    return {
      timestamp: new Date().toISOString(),
      countries: [],
      count: 0,
    };
  }
}

/**
 * 获取所有国家列表
 */
export async function getCountries(): Promise<string[]> {
  const data = await loadPackagesData();
  return data.countries;
}

/**
 * 获取特定国家的套餐
 */
export async function getPackagesByCountry(
  country: string
): Promise<ESIMPackage[]> {
  const data = await loadPackagesData();
  return data.packages[country] || [];
}

/**
 * 获取所有套餐
 */
export async function getAllPackages(): Promise<ESIMPackage[]> {
  const data = await loadPackagesData();
  return data.all_packages;
}

/**
 * 获取数据更新时间
 */
export async function getDataUpdateTime(): Promise<string> {
  const data = await loadPackagesData();
  return data.timestamp;
}

/**
 * 获取套餐统计信息
 */
export async function getPackagesStats(): Promise<{
  total: number;
  countries: number;
  providers: string[];
}> {
  const data = await loadPackagesData();
  const providers = Array.from(
    new Set(data.all_packages.map((p) => p.provider))
  );
  return {
    total: data.total_packages,
    countries: data.countries.length,
    providers,
  };
}

/**
 * 按提供商过滤套餐
 */
export async function getPackagesByProvider(
  provider: string
): Promise<ESIMPackage[]> {
  const data = await loadPackagesData();
  return data.all_packages.filter((p) => p.provider === provider);
}

/**
 * 按数据类型过滤套餐（Data 或 Unlimited）
 */
export async function getPackagesByType(
  type: "Data" | "Unlimited"
): Promise<ESIMPackage[]> {
  const data = await loadPackagesData();
  return data.all_packages.filter((p) => p.data_type === type);
}

/**
 * 获取最便宜的套餐
 */
export async function getCheapestPackages(limit: number = 10): Promise<ESIMPackage[]> {
  const data = await loadPackagesData();
  return data.all_packages
    .sort((a, b) => a.price - b.price)
    .slice(0, limit);
}
