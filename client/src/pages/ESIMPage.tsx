/**
 * GlobalPass E-SIM 比价与兼容性检测页面 (v1.1)
 * 
 * 设计理念：
 * - 深色主题背景 (Dark Mode)
 * - 绿色强调色 (Tech Green: #10B981)
 * - 玻璃拟态效果 (Glassmorphism)
 * - 现代科技感的布局和交互
 * 
 * v1.1 更新：
 * - 支持设备地区选择（全球版 vs 国行/港澳版）
 * - 真实 Airalo 价格数据
 * - 改进的设备兼容性检测
 */

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Smartphone, Globe, Loader2 } from "lucide-react";
import {
  getPackagesByCountry,
  getCountries,
  getSupportedDevices,
  isDeviceSupported,
  getDeviceRegions,
  type ESIMPackage,
  type SupportedDevice,
} from "@/lib/supabase";

export default function ESIMPage() {
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("Global");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [deviceSupported, setDeviceSupported] = useState<boolean | null>(null);
  
  // 数据状态
  const [countries, setCountries] = useState<string[]>([]);
  const [devices, setDevices] = useState<SupportedDevice[]>([]);
  const [countryPackages, setCountryPackages] = useState<ESIMPackage[]>([]);
  const [availableRegions, setAvailableRegions] = useState<string[]>(["Global"]);
  
  // 加载状态
  const [loading, setLoading] = useState(true);
  const [packagesLoading, setPackagesLoading] = useState(false);

  // 初始化：获取国家和设备列表
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        
        // 获取国家列表
        const countriesList = await getCountries();
        setCountries(countriesList);
        
        // 获取设备列表
        const devicesList = await getSupportedDevices();
        setDevices(devicesList);
        
        // 设置默认国家
        if (countriesList.length > 0) {
          setSelectedCountry(countriesList[0]);
        }
      } catch (err) {
        console.error("初始化数据失败:", err);
      } finally {
        setLoading(false);
      }
    };
    
    initData();
  }, []);

  // 当国家改变时，获取该国家的套餐
  useEffect(() => {
    const loadPackages = async () => {
      if (!selectedCountry) return;
      
      try {
        setPackagesLoading(true);
        const packages = await getPackagesByCountry(selectedCountry);
        setCountryPackages(packages);
      } catch (err) {
        console.error("获取套餐失败:", err);
        setCountryPackages([]);
      } finally {
        setPackagesLoading(false);
      }
    };
    
    loadPackages();
  }, [selectedCountry]);

  // 处理设备选择
  const handleDeviceChange = async (value: string) => {
    setSelectedDevice(value);
    setSelectedRegion("Global"); // 重置地区选择
    setDeviceSupported(null);
    
    if (value) {
      const device = devices.find((d) => d.id.toString() === value);
      if (device) {
        try {
          // 获取该设备的所有地区版本
          const regions = await getDeviceRegions(device.brand, device.model);
          setAvailableRegions(regions);
          setSelectedRegion(regions[0] || "Global");
        } catch (err) {
          console.error("获取设备地区版本失败:", err);
          setAvailableRegions(["Global"]);
          setSelectedRegion("Global");
        }
      }
    }
  };

  // 处理地区选择
  const handleRegionChange = async (region: string) => {
    setSelectedRegion(region);
    
    if (selectedDevice) {
      const device = devices.find((d) => d.id.toString() === selectedDevice);
      if (device) {
        try {
          const supported = await isDeviceSupported(device.brand, device.model, region);
          setDeviceSupported(supported);
        } catch (err) {
          console.error("检查设备支持状态失败:", err);
          setDeviceSupported(false);
        }
      }
    }
  };

  // 获取选中设备信息
  const selectedDeviceInfo = devices.find(
    (d) => d.id.toString() === selectedDevice
  );

  // 地区标签映射
  const regionLabels: Record<string, string> = {
    "Global": "🌍 国际版 (Global)",
    "China/HK/Macau": "🇨🇳 国行/港澳版",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-lg text-slate-300">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* 导航栏 */}
      <nav className="border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-emerald-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              GlobalPass
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            全球 E-SIM 比价与手机兼容性检测
          </p>
        </div>
      </nav>

      {/* 主容器 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 手机检测器部分 */}
        <div className="mb-12">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <Smartphone className="w-6 h-6 text-emerald-500" />
              <h2 className="text-2xl font-bold">📱 手机兼容性检测</h2>
            </div>

            <p className="text-slate-300 mb-6">
              选择您的手机型号和版本，检查是否支持 E-SIM
            </p>

            <div className="space-y-4">
              {/* 设备选择 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  选择手机型号
                </label>
                <Select value={selectedDevice} onValueChange={handleDeviceChange}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors">
                    <SelectValue placeholder="请选择您的手机型号..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    {devices.map((device) => (
                      <SelectItem
                        key={device.id}
                        value={device.id.toString()}
                        className="text-white hover:bg-emerald-500/20"
                      >
                        {device.brand} {device.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 地区版本选择 */}
              {selectedDevice && availableRegions.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    选择版本
                  </label>
                  <Select value={selectedRegion} onValueChange={handleRegionChange}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors">
                      <SelectValue placeholder="请选择版本..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10">
                      {availableRegions.map((region) => (
                        <SelectItem
                          key={region}
                          value={region}
                          className="text-white hover:bg-emerald-500/20"
                        >
                          {regionLabels[region] || region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 兼容性结果 */}
              {selectedDevice && deviceSupported !== null && (
                <div
                  className={`p-4 rounded-lg border-2 flex items-center gap-3 ${
                    deviceSupported
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-red-500/10 border-red-500/30"
                  }`}
                >
                  {deviceSupported ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-emerald-400">
                          ✅ 支持 E-SIM
                        </p>
                        <p className="text-sm text-slate-300">
                          {selectedDeviceInfo?.brand} {selectedDeviceInfo?.model}{" "}
                          ({regionLabels[selectedRegion] || selectedRegion}) 完全支持 E-SIM 功能
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-red-400">
                          ❌ 不支持 E-SIM
                        </p>
                        <p className="text-sm text-slate-300">
                          {selectedDeviceInfo?.brand} {selectedDeviceInfo?.model}{" "}
                          ({regionLabels[selectedRegion] || selectedRegion}) 暂不支持 E-SIM 功能
                          {selectedRegion === "China/HK/Macau" && "（物理双卡限制）"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 热门套餐部分 */}
        <div>
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-3">🌍 热门套餐</h2>
            <p className="text-slate-400">
              浏览全球主要国家的 E-SIM 套餐价格（数据来自 Airalo）
            </p>
          </div>

          {/* 国家选择标签 */}
          <div className="flex flex-wrap gap-3 mb-8">
            {countries.map((country) => (
              <button
                key={country}
                onClick={() => setSelectedCountry(country)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCountry === country
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                }`}
              >
                {country}
              </button>
            ))}
          </div>

          {/* 套餐卡片网格 */}
          {packagesLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
              <p className="text-slate-300">加载套餐中...</p>
            </div>
          ) : countryPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {countryPackages.map((pkg) => (
                <PackageCard key={pkg.id} package={pkg} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p>暂无该国家的套餐数据</p>
            </div>
          )}
        </div>

        {/* 底部信息 */}
        <div className="mt-16 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4">💡 关于 GlobalPass</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            GlobalPass 是一个全球 E-SIM 比价平台，帮助您快速找到最优惠的国际数据套餐。我们汇集了全球主要运营商的实时价格，并提供设备兼容性检测，确保您的手机支持 E-SIM 功能。
          </p>
          <p className="text-slate-400 text-sm">
            ⚠️ 注意：中国大陆、香港、澳门版本的 iPhone 14 及更早机型由于物理双卡限制，不支持 E-SIM。请使用国际版本以获得完整支持。
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 套餐卡片组件
 * 使用玻璃拟态效果
 */
function PackageCard({ package: pkg }: { package: ESIMPackage }) {
  return (
    <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/20">
      {/* 背景渐变效果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-transparent to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:to-emerald-500/5 transition-all duration-300" />

      <div className="relative p-6">
        {/* 国家和提供商 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">{pkg.country}</h3>
          <Badge
            variant="secondary"
            className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
          >
            {pkg.provider}
          </Badge>
        </div>

        {/* 数据量 */}
        <div className="mb-6">
          <p className="text-sm text-slate-400 mb-2">数据量</p>
          <p className="text-3xl font-bold text-emerald-400">{pkg.data_amount}</p>
        </div>

        {/* 价格 */}
        <div className="mb-6 pb-6 border-b border-white/10">
          <p className="text-sm text-slate-400 mb-2">价格</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white">${pkg.price}</span>
            <span className="text-slate-400">/套餐</span>
          </div>
        </div>

        {/* 购买按钮 */}
        <a
          href={pkg.affiliate_link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-300 text-center block shadow-lg hover:shadow-emerald-500/50"
        >
          立即购买 →
        </a>
      </div>
    </Card>
  );
}
