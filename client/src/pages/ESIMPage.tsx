/**
 * GlobalPass E-SIM 比价与兼容性检测页面
 * 
 * 设计理念：
 * - 深色主题背景 (Dark Mode)
 * - 绿色强调色 (Tech Green: #10B981)
 * - 玻璃拟态效果 (Glassmorphism)
 * - 现代科技感的布局和交互
 */

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Smartphone, Globe } from "lucide-react";
import {
  esimPackages,
  supportedDevices,
  getCountries,
  isDeviceSupported,
  type ESIMPackage,
} from "@/data/esim-data";

export default function ESIMPage() {
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("Japan");
  const [deviceSupported, setDeviceSupported] = useState<boolean | null>(null);

  // 处理设备选择
  const handleDeviceChange = (value: string) => {
    setSelectedDevice(value);
    if (value) {
      const device = supportedDevices.find((d) => d.id === value);
      if (device) {
        const supported = isDeviceSupported(device.brand, device.model);
        setDeviceSupported(supported);
      }
    }
  };

  // 获取选中国家的套餐
  const countryPackages = esimPackages.filter(
    (pkg) => pkg.country === selectedCountry
  );

  // 获取所有国家
  const countries = getCountries();

  // 获取选中设备信息
  const selectedDeviceInfo = supportedDevices.find(
    (d) => d.id === selectedDevice
  );

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
              选择您的手机型号，检查是否支持 E-SIM
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  选择手机型号
                </label>
                <Select value={selectedDevice} onValueChange={handleDeviceChange}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors">
                    <SelectValue placeholder="请选择您的手机型号..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    {supportedDevices.map((device) => (
                      <SelectItem
                        key={device.id}
                        value={device.id}
                        className="text-white hover:bg-emerald-500/20"
                      >
                        {device.brand} {device.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                          完全支持 E-SIM 功能
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
                          暂不支持 E-SIM 功能
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
              浏览全球主要国家的 E-SIM 套餐价格
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {countryPackages.map((pkg) => (
              <PackageCard key={pkg.id} package={pkg} />
            ))}
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-16 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4">💡 关于 GlobalPass</h3>
          <p className="text-slate-300 leading-relaxed">
            GlobalPass 是一个全球 E-SIM 比价平台，帮助您快速找到最优惠的国际数据套餐。我们汇集了全球主要运营商的实时价格，并提供设备兼容性检测，确保您的手机支持 E-SIM 功能。
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
          <p className="text-3xl font-bold text-emerald-400">{pkg.dataAmount}</p>
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
          href={pkg.affiliateLink}
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
