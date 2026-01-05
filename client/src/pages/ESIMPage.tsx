/**
 * GlobalPass E-SIM 比价与兼容性检测页面 (v2.0 - Phase 3)
 * 
 * Phase 3 新增功能：
 * - 即时搜索框（Real-time Search）
 * - 热门推荐区域（Popular Destinations）
 * - 筛选器（按流量、有效期）
 * - 优化比价卡片（价格排序、视觉区分提供商、无限流量高亮）
 * - AI 导购聊天（集成 Gemini）
 */

import { useState, useEffect, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Smartphone, Globe, Loader2, Search, Filter, Sparkles } from "lucide-react";
import {
  getPackagesByCountry,
  getCountries,
  type ESIMPackage,
} from "@/lib/data-loader";
import {
  getSupportedDevices,
  isDeviceSupported,
  getDeviceRegions,
  type SupportedDevice,
} from "@/lib/supabase";
import { AIChatDialog } from "@/components/AIChatDialog";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function ESIMPage() {
  const { t } = useTranslation();
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("Global");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [deviceSupported, setDeviceSupported] = useState<boolean | null>(null);
  
  // 搜索和筛选状态
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dataTypeFilter, setDataTypeFilter] = useState<string>("all");
  const [validityFilter, setValidityFilter] = useState<string>("all");
  
  // 数据状态
  const [countries, setCountries] = useState<string[]>([]);
  const [devices, setDevices] = useState<SupportedDevice[]>([]);
  const [countryPackages, setCountryPackages] = useState<ESIMPackage[]>([]);
  const [availableRegions, setAvailableRegions] = useState<string[]>(["Global"]);
  
  // 加载状态
  const [loading, setLoading] = useState(true);
  const [packagesLoading, setPackagesLoading] = useState(false);
  
  // AI 聊天对话框状态
  const [aiChatOpen, setAiChatOpen] = useState(false);

  // 热门推荐国家
  const popularCountries = ["Japan", "USA", "Thailand", "South Korea"];

  // 初始化：获取国家和设备列表
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        
        // 获取国家列表（从本地 JSON）
        const countriesList = await getCountries();
        setCountries(countriesList);
        
        // 获取设备列表（从 Supabase）
        const devicesList = await getSupportedDevices();
        setDevices(devicesList);
        
        // 设置默认国家（热门推荐的第一个）
        if (countriesList.length > 0) {
          setSelectedCountry(popularCountries[0] || countriesList[0]);
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
    setSelectedRegion("Global");
    setDeviceSupported(null);
    
    if (value) {
      const device = devices.find((d) => d.id.toString() === value);
      if (device) {
        try {
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

  // 筛选后的国家列表（根据搜索框）
  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries;
    return countries.filter((country) =>
      country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [countries, searchQuery]);

  // 筛选后的套餐列表（根据数据类型和有效期）
  const filteredPackages = useMemo(() => {
    let filtered = [...countryPackages];

    // 按数据类型筛选
    if (dataTypeFilter !== "all") {
      if (dataTypeFilter === "unlimited") {
        filtered = filtered.filter((pkg) => pkg.data_type === "Unlimited");
      } else {
        filtered = filtered.filter((pkg) => pkg.data_type !== "Unlimited");
      }
    }

    // 按有效期筛选
    if (validityFilter !== "all") {
      filtered = filtered.filter((pkg) => pkg.validity?.includes(validityFilter));
    }

    // 按价格排序（从低到高）
    filtered.sort((a, b) => a.price - b.price);

    return filtered;
  }, [countryPackages, dataTypeFilter, validityFilter]);

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
      <nav className="border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-emerald-500" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                  {t('common.appName')}
                </h1>
                <p className="text-xs text-slate-400">{t('common.tagline')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              {/* AI 导购按钮 */}
              <Button 
                variant="default"
                onClick={() => setAiChatOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {t('esim.aiChat.title')}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主容器 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 即时搜索框 */}
        <div className="mb-12">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-6 h-6 text-emerald-500" />
              <h2 className="text-2xl font-bold">🔍 {t('esim.search.title')}</h2>
            </div>
            <p className="text-slate-300 mb-6">
              {t('esim.search.hint')}
            </p>
            <Input
              type="text"
              placeholder={t('esim.search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-400 text-lg py-6"
            />
          </div>
        </div>

        {/* 热门推荐 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">🔥 {t('esim.popular.title')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularCountries.map((country) => (
              <button
                key={country}
                onClick={() => {
                  setSelectedCountry(country);
                  setSearchQuery("");
                }}
                className={`p-6 rounded-xl font-medium transition-all duration-300 ${
                  selectedCountry === country
                    ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/50 scale-105"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 hover:scale-105"
                }`}
              >
                <div className="text-3xl mb-2">
                  {country === "Japan" && "🇯🇵"}
                  {country === "USA" && "🇺🇸"}
                  {country === "Thailand" && "🇹🇭"}
                  {country === "South Korea" && "🇰🇷"}
                </div>
                <div className="font-semibold">{country}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 手机检测器部分 */}
        <div className="mb-12">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <Smartphone className="w-6 h-6 text-emerald-500" />
              <h2 className="text-2xl font-bold">📱 {t('esim.compatibility.title')}</h2>
            </div>

            <p className="text-slate-300 mb-6">
              {t('esim.compatibility.description')}
            </p>

            <div className="space-y-4">
              {/* 设备选择 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  {t('esim.compatibility.selectModel')}
                </label>
                <Select value={selectedDevice} onValueChange={handleDeviceChange}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors">
                    <SelectValue placeholder={t('esim.compatibility.selectModelPlaceholder')} />
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

        {/* 套餐比价部分 */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-3">💰 {t('esim.comparison.title')}</h2>
              <p className="text-slate-400">
                {selectedCountry} - {t('esim.comparison.subtitle')}
              </p>
            </div>
            
            {/* 筛选器 */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-emerald-500" />
              <Select value={dataTypeFilter} onValueChange={setDataTypeFilter}>
                <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="流量类型" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="all" className="text-white">{t('esim.comparison.filters.allData')}</SelectItem>
                  <SelectItem value="unlimited" className="text-white">{t('esim.card.unlimited')}</SelectItem>
                  <SelectItem value="limited" className="text-white">Limited Data</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={validityFilter} onValueChange={setValidityFilter}>
                <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="有效期" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="all" className="text-white">{t('esim.comparison.filters.allValidity')}</SelectItem>
                  <SelectItem value="3 Days" className="text-white">3 天</SelectItem>
                  <SelectItem value="7 Days" className="text-white">7 天</SelectItem>
                  <SelectItem value="15 Days" className="text-white">15 天</SelectItem>
                  <SelectItem value="30 Days" className="text-white">30 天</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 国家选择标签 */}
          <div className="flex flex-wrap gap-3 mb-8">
            {(searchQuery ? filteredCountries : countries).slice(0, 10).map((country) => (
              <button
                key={country}
                onClick={() => {
                  setSelectedCountry(country);
                  setSearchQuery("");
                }}
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
          ) : filteredPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map((pkg) => (
                <PackageCard key={pkg.id} package={pkg} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p>暂无符合条件的套餐</p>
            </div>
          )}
        </div>

        {/* 底部信息 */}
        <div className="mt-16 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4">💡 关于 GlobalPass</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            GlobalPass 是一个全球 E-SIM 比价平台，帮助您快速找到最优惠的国际数据套餐。我们汇集了 Airalo、Nomad 等全球主要运营商的实时价格，并提供设备兼容性检测，确保您的手机支持 E-SIM 功能。
          </p>
          <p className="text-slate-400 text-sm">
            ⚠️ 注意：中国大陆、香港、澳门版本的 iPhone 14 及更早机型由于物理双卡限制，不支持 E-SIM。请使用国际版本以获得完整支持。
          </p>
        </div>
      </div>
      
      {/* AI 聊天对话框 */}
      <AIChatDialog open={aiChatOpen} onOpenChange={setAiChatOpen} />
    </div>
  );
}

/**
 * 套餐卡片组件
 * Phase 3 优化：
 * - 视觉区分 Airalo 和 Nomad（Logo 颜色）
 * - 无限流量套餐高亮（金色/紫色边框）
 */
function PackageCard({ package: pkg }: { package: ESIMPackage }) {
  const { t } = useTranslation();
  const isUnlimited = pkg.data_type === "Unlimited";
  const isAiralo = pkg.provider === "Airalo";
  const isNomad = pkg.provider === "Nomad";

  return (
    <Card 
      className={`group relative overflow-hidden backdrop-blur-xl border transition-all duration-300 shadow-xl hover:shadow-2xl ${
        isUnlimited
          ? "bg-gradient-to-br from-purple-500/10 to-yellow-500/10 border-purple-500/50 hover:border-yellow-500/70 hover:shadow-purple-500/30"
          : "bg-white/5 border-white/10 hover:border-emerald-500/50 hover:bg-white/10 hover:shadow-emerald-500/20"
      }`}
    >
      {/* 无限流量标签 */}
      {isUnlimited && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          ⚡ {t('esim.card.unlimited')}
        </div>
      )}

      {/* 背景渐变效果 */}
      <div className={`absolute inset-0 transition-all duration-300 ${
        isUnlimited
          ? "bg-gradient-to-br from-purple-500/0 via-transparent to-yellow-500/0 group-hover:from-purple-500/10 group-hover:to-yellow-500/10"
          : "bg-gradient-to-br from-emerald-500/0 via-transparent to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:to-emerald-500/5"
      }`} />

      <div className="relative p-6">
        {/* 国家和提供商 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">{pkg.country}</h3>
          <Badge
            variant="secondary"
            className={`font-semibold ${
              isAiralo
                ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                : isNomad
                ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
            }`}
          >
            {isAiralo && "🔵 "}
            {isNomad && "🟠 "}
            {pkg.provider}
          </Badge>
        </div>

        {/* 套餐名称 */}
        <div className="mb-4">
          <p className="text-sm text-slate-400 mb-1">{t('esim.card.planName')}</p>
          <p className="text-lg font-semibold text-white">{pkg.plan_name}</p>
        </div>

        {/* 数据量 */}
        <div className="mb-6">
          <p className="text-sm text-slate-400 mb-2">{t('esim.card.data')}</p>
          <p className={`text-3xl font-bold ${
            isUnlimited ? "text-transparent bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text" : "text-emerald-400"
          }`}>
            {pkg.data_amount}
          </p>
        </div>

        {/* 有效期 */}
        {pkg.validity && (
          <div className="mb-4">
            <p className="text-sm text-slate-400 mb-2">{t('esim.card.validity')}</p>
            <p className="text-sm font-semibold text-emerald-300">{pkg.validity}</p>
          </div>
        )}

        {/* 价格 */}
        <div className="mb-6 pb-6 border-b border-white/10">
          <p className="text-sm text-slate-400 mb-2">{t('esim.card.price')}</p>
          <div className="flex items-baseline gap-1 mb-2">
            {(() => {
              // 解析 raw_data 获取币种信息
              // 统一显示美元价格
              return (
                <>
                  <span className="text-4xl font-bold text-white">${pkg.price}</span>
                  <span className="text-slate-400">/USD</span>
                </>
              );
            })()}
          </div>
          <p className="text-xs text-slate-500 italic">
            {t('esim.card.priceDisclaimer')}
          </p>
        </div>

        {/* 购买按钮 */}
        <a
          href={pkg.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full py-3 px-4 font-semibold rounded-lg transition-all duration-300 text-center block shadow-lg ${
            isUnlimited
              ? "bg-gradient-to-r from-purple-500 to-yellow-500 hover:from-purple-600 hover:to-yellow-600 text-white hover:shadow-purple-500/50"
              : isAiralo
              ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-blue-500/50"
              : isNomad
              ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:shadow-orange-500/50"
              : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white hover:shadow-emerald-500/50"
          }`}
        >
          {t('esim.card.buyNow')}
        </a>
      </div>
    </Card>
  );
}
