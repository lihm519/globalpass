'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

// 地区定义
const regions = [
  { id: 'global', name: '国际版 (Global)', nameEn: 'Global' },
  { id: 'cn', name: '中国大陆 (China Mainland)', nameEn: 'China Mainland' },
  { id: 'hk', name: '香港/澳门 (Hong Kong/Macau)', nameEn: 'Hong Kong/Macau' },
  { id: 'us', name: '美国 (USA)', nameEn: 'USA' },
  { id: 'jp', name: '日本 (Japan)', nameEn: 'Japan' },
  { id: 'eu', name: '欧洲 (Europe)', nameEn: 'Europe' },
];

// 手机品牌和型号数据
const phoneData = {
  Apple: [
    // 2025-2026 最新机型
    'iPhone 17 Pro Max', 'iPhone 17 Pro', 'iPhone 17', 'iPhone Air',
    // 2024-2025 机型
    'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16',
    'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
    // 2022-2023 机型
    'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
    'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 mini',
    // 2020-2021 机型
    'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 12 mini',
    'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
    // 2018-2019 机型
    'iPhone XS Max', 'iPhone XS', 'iPhone XR',
    'iPhone SE (2022)', 'iPhone SE (2020)',
  ],
  Samsung: [
    // 2026 最新机型
    'Galaxy S26 Ultra', 'Galaxy S26+', 'Galaxy S26',
    // 2024-2025 机型
    'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24',
    'Galaxy Z Fold 6', 'Galaxy Z Fold 5', 'Galaxy Z Flip 6', 'Galaxy Z Flip 5',
    // 2023 机型
    'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23', 'Galaxy S23 FE',
    'Galaxy Z Fold 4', 'Galaxy Z Flip 4',
    // 2022 机型
    'Galaxy S22 Ultra', 'Galaxy S22+', 'Galaxy S22',
    'Galaxy Z Fold 3', 'Galaxy Z Flip 3',
    // 2021 机型
    'Galaxy S21 Ultra', 'Galaxy S21+', 'Galaxy S21', 'Galaxy S21 FE',
    // A 系列
    'Galaxy A54', 'Galaxy A53', 'Galaxy A34',
  ],
  Google: [
    // 2025-2026 最新机型
    'Pixel 10 Pro XL', 'Pixel 10 Pro', 'Pixel 10',
    // 2024-2025 机型
    'Pixel 9 Pro XL', 'Pixel 9 Pro', 'Pixel 9',
    'Pixel 8 Pro', 'Pixel 8', 'Pixel 8a',
    // 2022-2023 机型
    'Pixel 7 Pro', 'Pixel 7', 'Pixel 7a',
    'Pixel 6 Pro', 'Pixel 6', 'Pixel 6a',
    // 老款机型
    'Pixel 5', 'Pixel 4a',
  ],
  Huawei: [
    // 2023-2024 最新机型
    'Pura 70 Ultra', 'Pura 70 Pro', 'Pura 70',
    'Mate 60 Pro+', 'Mate 60 Pro', 'Mate 60',
    // 2022 机型
    'P60 Pro', 'P60', 'P50 Pro', 'P50',
    'Mate 50 Pro', 'Mate 50',
    // 老款机型
    'P40 Pro', 'Mate 40 Pro',
  ],
  Xiaomi: [
    // 2024-2025 最新机型
    'Xiaomi 14 Ultra', 'Xiaomi 14 Pro', 'Xiaomi 14',
    'Xiaomi 13 Ultra', 'Xiaomi 13 Pro', 'Xiaomi 13',
    // 2022-2023 机型
    'Xiaomi 12S Ultra', 'Xiaomi 12 Pro', 'Xiaomi 12',
    'Xiaomi 11 Ultra', 'Xiaomi 11 Pro', 'Xiaomi 11',
    // Redmi 系列
    'Redmi Note 13 Pro+', 'Redmi Note 12 Pro+',
  ],
  OPPO: [
    // 2024-2025 最新机型
    'Find X7 Ultra', 'Find X7 Pro', 'Find X7',
    'Find X6 Pro', 'Find X6',
    'Find X5 Pro', 'Find X5',
    // Reno 系列
    'Reno 11 Pro', 'Reno 10 Pro+',
  ],
  OnePlus: [
    // 2024-2025 最新机型
    'OnePlus 12', 'OnePlus 12R',
    'OnePlus 11', 'OnePlus 11R',
    'OnePlus 10 Pro', 'OnePlus 10T',
    'OnePlus 9 Pro', 'OnePlus 9',
  ],
};

// E-SIM 地区兼容性数据
// 格式：{ 机型: { 地区: 是否支持 } }
const esimRegionalCompatibility: Record<string, Record<string, boolean>> = {
  // Apple iPhone - 地区差异最大
  // iPhone 17 系列
  'iPhone 17 Pro Max': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'iPhone 17 Pro': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'iPhone 17': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'iPhone Air': { global: true, cn: true, hk: true, us: true, jp: true, eu: true }, // 特殊：中国大陆唯一支持 eSIM 的 iPhone
  
  // iPhone 16 系列
  'iPhone 16 Pro Max': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'iPhone 16 Pro': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'iPhone 16 Plus': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'iPhone 16': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  
  // iPhone 15 系列
  'iPhone 15 Pro Max': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'iPhone 15 Pro': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'iPhone 15 Plus': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'iPhone 15': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  
  // iPhone 14 系列
  'iPhone 14 Pro Max': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'iPhone 14 Pro': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'iPhone 14 Plus': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'iPhone 14': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  
  // iPhone 13 系列
  'iPhone 13 Pro Max': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'iPhone 13 Pro': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'iPhone 13': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'iPhone 13 mini': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  
  // iPhone 12 系列
  'iPhone 12 Pro Max': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'iPhone 12 Pro': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'iPhone 12': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'iPhone 12 mini': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  
  // iPhone 11 系列
  'iPhone 11 Pro Max': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'iPhone 11 Pro': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'iPhone 11': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  
  // iPhone XS/XR 系列
  'iPhone XS Max': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'iPhone XS': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'iPhone XR': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  
  // iPhone SE
  'iPhone SE (2022)': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'iPhone SE (2020)': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  
  // Samsung - 大部分地区支持
  // Galaxy S26 系列
  'Galaxy S26 Ultra': { global: true, cn: true, hk: true, us: true, jp: true, eu: true },
  'Galaxy S26+': { global: true, cn: true, hk: true, us: true, jp: true, eu: true },
  'Galaxy S26': { global: true, cn: true, hk: true, us: true, jp: true, eu: true },
  
  // Galaxy S24 系列
  'Galaxy S24 Ultra': { global: true, cn: true, hk: true, us: true, jp: true, eu: true },
  'Galaxy S24+': { global: true, cn: true, hk: true, us: true, jp: true, eu: true },
  'Galaxy S24': { global: true, cn: true, hk: true, us: true, jp: true, eu: true },
  'Galaxy Z Fold 6': { global: true, cn: true, hk: true, us: true, jp: true, eu: true },
  'Galaxy Z Fold 5': { global: true, cn: true, hk: true, us: true, jp: true, eu: true },
  'Galaxy Z Flip 6': { global: true, cn: true, hk: true, us: true, jp: true, eu: true },
  'Galaxy Z Flip 5': { global: true, cn: true, hk: true, us: true, jp: true, eu: true },
  
  // Galaxy S23 系列
  'Galaxy S23 Ultra': { global: true, cn: true, hk: true, us: true, jp: true, eu: true },
  'Galaxy S23+': { global: true, cn: true, hk: true, us: true, jp: true, eu: true },
  'Galaxy S23': { global: true, cn: true, hk: true, us: true, jp: true, eu: true },
  'Galaxy S23 FE': { global: true, cn: true, hk: true, us: true, jp: true, eu: true },
  'Galaxy Z Fold 4': { global: true, cn: true, hk: true, us: true, jp: true, eu: true },
  'Galaxy Z Flip 4': { global: true, cn: true, hk: true, us: true, jp: true, eu: true },
  
  // Galaxy S22 系列
  'Galaxy S22 Ultra': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'Galaxy S22+': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'Galaxy S22': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'Galaxy Z Fold 3': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'Galaxy Z Flip 3': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  
  // Galaxy S21 系列
  'Galaxy S21 Ultra': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'Galaxy S21+': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'Galaxy S21': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'Galaxy S21 FE': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  
  // Galaxy A 系列
  'Galaxy A54': { global: true, cn: false, hk: false, us: true, jp: false, eu: true },
  'Galaxy A53': { global: false, cn: false, hk: false, us: false, jp: false, eu: false },
  'Galaxy A34': { global: false, cn: false, hk: false, us: false, jp: false, eu: false },
  
  // Google Pixel - 美国版特殊
  // Pixel 10 系列（美国版仅 eSIM）
  'Pixel 10 Pro XL': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'Pixel 10 Pro': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'Pixel 10': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  
  // Pixel 9 系列
  'Pixel 9 Pro XL': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'Pixel 9 Pro': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'Pixel 9': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  
  // Pixel 8 系列
  'Pixel 8 Pro': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'Pixel 8': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'Pixel 8a': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  
  // Pixel 7 系列
  'Pixel 7 Pro': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'Pixel 7': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'Pixel 7a': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  
  // Pixel 6 系列
  'Pixel 6 Pro': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'Pixel 6': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'Pixel 6a': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  
  // Pixel 老款
  'Pixel 5': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  'Pixel 4a': { global: true, cn: false, hk: true, us: true, jp: true, eu: true },
  
  // Huawei - 国际版支持
  'Pura 70 Ultra': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Pura 70 Pro': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Pura 70': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Mate 60 Pro+': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Mate 60 Pro': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Mate 60': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'P60 Pro': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'P60': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'P50 Pro': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'P50': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Mate 50 Pro': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Mate 50': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'P40 Pro': { global: false, cn: false, hk: false, us: false, jp: false, eu: false },
  'Mate 40 Pro': { global: false, cn: false, hk: false, us: false, jp: false, eu: false },
  
  // Xiaomi - 国际版支持
  'Xiaomi 14 Ultra': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Xiaomi 14 Pro': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Xiaomi 14': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Xiaomi 13 Ultra': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Xiaomi 13 Pro': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Xiaomi 13': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Xiaomi 12S Ultra': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Xiaomi 12 Pro': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Xiaomi 12': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Xiaomi 11 Ultra': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Xiaomi 11 Pro': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Xiaomi 11': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Redmi Note 13 Pro+': { global: false, cn: false, hk: false, us: false, jp: false, eu: false },
  'Redmi Note 12 Pro+': { global: false, cn: false, hk: false, us: false, jp: false, eu: false },
  
  // OPPO - 国际版支持
  'Find X7 Ultra': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Find X7 Pro': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Find X7': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Find X6 Pro': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Find X6': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Find X5 Pro': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Find X5': { global: true, cn: false, hk: true, us: false, jp: false, eu: true },
  'Reno 11 Pro': { global: false, cn: false, hk: false, us: false, jp: false, eu: false },
  'Reno 10 Pro+': { global: false, cn: false, hk: false, us: false, jp: false, eu: false },
  
  // OnePlus - 国际版支持
  'OnePlus 12': { global: true, cn: false, hk: true, us: true, jp: false, eu: true },
  'OnePlus 12R': { global: true, cn: false, hk: true, us: true, jp: false, eu: true },
  'OnePlus 11': { global: true, cn: false, hk: true, us: true, jp: false, eu: true },
  'OnePlus 11R': { global: true, cn: false, hk: true, us: true, jp: false, eu: true },
  'OnePlus 10 Pro': { global: true, cn: false, hk: true, us: true, jp: false, eu: true },
  'OnePlus 10T': { global: true, cn: false, hk: true, us: true, jp: false, eu: true },
  'OnePlus 9 Pro': { global: true, cn: false, hk: true, us: true, jp: false, eu: true },
  'OnePlus 9': { global: true, cn: false, hk: true, us: true, jp: false, eu: true },
};

export default function CompatibilityPage() {
  const { t } = useTranslation();
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('global');
  const [result, setResult] = useState<{ compatible: boolean; message: string } | null>(null);

  const handleCheck = () => {
    if (!selectedBrand || !selectedModel || !selectedRegion) {
      setResult({
        compatible: false,
        message: t('compatibility.pleaseSelectAll') || '请选择品牌、型号和地区',
      });
      return;
    }

    const regionalSupport = esimRegionalCompatibility[selectedModel];
    if (!regionalSupport) {
      setResult({
        compatible: false,
        message: t('compatibility.notSupported') || '该机型不支持 eSIM',
      });
      return;
    }

    const isSupported = regionalSupport[selectedRegion];
    const regionName = regions.find(r => r.id === selectedRegion)?.name || selectedRegion;
    
    if (isSupported) {
      // 特殊提示
      let specialNote = '';
      if (selectedModel === 'iPhone Air' && selectedRegion === 'cn') {
        specialNote = '\n\n✨ iPhone Air 是中国大陆唯一支持 eSIM 的 iPhone 机型！';
      } else if (selectedModel.startsWith('Pixel 10') && selectedRegion === 'us') {
        specialNote = '\n\n⚠️ 美国版 Pixel 10 仅支持 eSIM，无实体 SIM 卡槽。';
      } else if (selectedBrand === 'Apple' && selectedRegion === 'cn' && selectedModel !== 'iPhone Air') {
        specialNote = '\n\n❌ 注意：中国大陆销售的 iPhone（除 iPhone Air 外）均不支持 eSIM。';
      }
      
      setResult({
        compatible: true,
        message: `✅ ${selectedModel} (${regionName}) 支持 eSIM！${specialNote}`,
      });
    } else {
      let reason = '';
      if (selectedBrand === 'Apple' && selectedRegion === 'cn' && selectedModel !== 'iPhone Air') {
        reason = '\n\n原因：中国大陆销售的 iPhone（除 iPhone Air 外）均不支持 eSIM 功能。';
      } else if (selectedRegion === 'cn') {
        reason = '\n\n原因：中国大陆版本不支持 eSIM。';
      } else {
        reason = '\n\n原因：该地区版本不支持 eSIM 功能。';
      }
      
      setResult({
        compatible: false,
        message: `❌ ${selectedModel} (${regionName}) 不支持 eSIM${reason}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          {t('compatibility.title') || '手机兼容性检测'}
        </h1>
        <p className="text-center text-gray-300 mb-12">
          {t('compatibility.subtitle') || '检查您的手机是否支持 eSIM（按地区）'}
        </p>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* 地区选择 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-200">
              {t('compatibility.selectRegion') || '1. 选择购买地区'}
            </label>
            <select
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setResult(null);
              }}
            >
              {regions.map((region) => (
                <option key={region.id} value={region.id} className="bg-slate-800">
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          {/* 品牌选择 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-200">
              {t('compatibility.selectBrand') || '2. 选择手机品牌'}
            </label>
            <select
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setSelectedModel('');
                setResult(null);
              }}
            >
              <option value="" className="bg-slate-800">{t('compatibility.chooseBrand') || '-- 请选择品牌 --'}</option>
              {Object.keys(phoneData).map((brand) => (
                <option key={brand} value={brand} className="bg-slate-800">
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* 型号选择 */}
          {selectedBrand && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-200">
                {t('compatibility.selectModel') || '3. 选择手机型号'}
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  setResult(null);
                }}
              >
                <option value="" className="bg-slate-800">{t('compatibility.chooseModel') || '-- 请选择型号 --'}</option>
                {phoneData[selectedBrand as keyof typeof phoneData].map((model) => (
                  <option key={model} value={model} className="bg-slate-800">
                    {model}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 检测按钮 */}
          <button
            onClick={handleCheck}
            disabled={!selectedBrand || !selectedModel}
            className="w-full py-4 rounded-lg bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-semibold text-lg hover:from-blue-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {t('compatibility.checkButton') || '检测兼容性'}
          </button>

          {/* 结果显示 */}
          {result && (
            <div
              className={`mt-6 p-6 rounded-lg ${
                result.compatible
                  ? 'bg-emerald-500/20 border-2 border-emerald-500'
                  : 'bg-red-500/20 border-2 border-red-500'
              }`}
            >
              <p className="text-lg whitespace-pre-line">{result.message}</p>
            </div>
          )}
        </div>

        {/* 重要提示 */}
        <div className="mt-8 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-yellow-400">⚠️ 重要提示</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• <strong>iPhone：</strong>中国大陆销售的所有 iPhone（除 iPhone Air 外）均不支持 eSIM</li>
            <li>• <strong>Google Pixel 10：</strong>美国版仅支持 eSIM，无实体 SIM 卡槽</li>
            <li>• <strong>Samsung：</strong>S23 及以后的机型在中国大陆也支持 eSIM</li>
            <li>• <strong>其他品牌：</strong>中国大陆版本通常不支持 eSIM，建议购买国际版或香港版</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
