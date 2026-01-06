/**
 * GlobalPass E-SIM 数据配置
 * 包含套餐价格和设备兼容性信息
 */

export interface ESIMPackage {
  id: string;
  country: string;
  countryCode: string;
  dataAmount: string;
  price: number;
  provider: string;
  affiliateLink: string;
}

export interface SupportedDevice {
  id: string;
  brand: string;
  model: string;
  isSupported: boolean;
}

// E-SIM 套餐数据
export const esimPackages: ESIMPackage[] = [
  // 日本
  {
    id: "jp-1gb",
    country: "Japan",
    countryCode: "JP",
    dataAmount: "1GB",
    price: 4.99,
    provider: "Airalo",
    affiliateLink: "https://airalo.com/japan",
  },
  {
    id: "jp-3gb",
    country: "Japan",
    countryCode: "JP",
    dataAmount: "3GB",
    price: 9.99,
    provider: "Airalo",
    affiliateLink: "https://airalo.com/japan",
  },
  {
    id: "jp-10gb",
    country: "Japan",
    countryCode: "JP",
    dataAmount: "10GB",
    price: 24.99,
    provider: "Airalo",
    affiliateLink: "https://airalo.com/japan",
  },

  // 美国
  {
    id: "us-1gb",
    country: "USA",
    countryCode: "US",
    dataAmount: "1GB",
    price: 5.99,
    provider: "Airalo",
    affiliateLink: "https://airalo.com/usa",
  },
  {
    id: "us-3gb",
    country: "USA",
    countryCode: "US",
    dataAmount: "3GB",
    price: 12.99,
    provider: "Airalo",
    affiliateLink: "https://airalo.com/usa",
  },
  {
    id: "us-10gb",
    country: "USA",
    countryCode: "US",
    dataAmount: "10GB",
    price: 29.99,
    provider: "Airalo",
    affiliateLink: "https://airalo.com/usa",
  },

  // 泰国
  {
    id: "th-1gb",
    country: "Thailand",
    countryCode: "TH",
    dataAmount: "1GB",
    price: 3.99,
    provider: "Airalo",
    affiliateLink: "https://airalo.com/thailand",
  },
  {
    id: "th-3gb",
    country: "Thailand",
    countryCode: "TH",
    dataAmount: "3GB",
    price: 8.99,
    provider: "Airalo",
    affiliateLink: "https://airalo.com/thailand",
  },
  {
    id: "th-10gb",
    country: "Thailand",
    countryCode: "TH",
    dataAmount: "10GB",
    price: 19.99,
    provider: "Airalo",
    affiliateLink: "https://airalo.com/thailand",
  },
];

// 支持的设备
export const supportedDevices: SupportedDevice[] = [
  {
    id: "iphone-14",
    brand: "Apple",
    model: "iPhone 14",
    isSupported: true,
  },
  {
    id: "iphone-15",
    brand: "Apple",
    model: "iPhone 15",
    isSupported: true,
  },
  {
    id: "iphone-15-pro",
    brand: "Apple",
    model: "iPhone 15 Pro",
    isSupported: true,
  },
  {
    id: "iphone-15-pro-max",
    brand: "Apple",
    model: "iPhone 15 Pro Max",
    isSupported: true,
  },
  {
    id: "samsung-s23",
    brand: "Samsung",
    model: "Galaxy S23",
    isSupported: true,
  },
  {
    id: "samsung-s24",
    brand: "Samsung",
    model: "Galaxy S24",
    isSupported: true,
  },
  {
    id: "google-pixel-8",
    brand: "Google",
    model: "Pixel 8",
    isSupported: true,
  },
  {
    id: "google-pixel-8-pro",
    brand: "Google",
    model: "Pixel 8 Pro",
    isSupported: true,
  },
];

// 获取特定国家的套餐
export function getPackagesByCountry(country: string): ESIMPackage[] {
  return esimPackages.filter((pkg) => pkg.country === country);
}

// 获取所有国家列表
export function getCountries(): string[] {
  const countries = new Set(esimPackages.map((pkg) => pkg.country));
  return Array.from(countries);
}

// 检查设备是否支持 E-SIM
export function isDeviceSupported(brand: string, model: string): boolean {
  return supportedDevices.some(
    (device) =>
      device.brand.toLowerCase() === brand.toLowerCase() &&
      device.model.toLowerCase() === model.toLowerCase() &&
      device.isSupported
  );
}
