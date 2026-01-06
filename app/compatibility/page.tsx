'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

// 手机品牌和型号数据
const phoneData = {
  Apple: [
    // 2024-2025 最新机型
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
    // 2024-2025 最新机型
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
    // 2024-2025 最新机型
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

// E-SIM 兼容性数据（简化版）
const esimCompatibility: Record<string, boolean> = {
  // Apple - 所有 iPhone XR 及以后的机型均支持 eSIM
  'iPhone 16 Pro Max': true,
  'iPhone 16 Pro': true,
  'iPhone 16 Plus': true,
  'iPhone 16': true,
  'iPhone 15 Pro Max': true,
  'iPhone 15 Pro': true,
  'iPhone 15 Plus': true,
  'iPhone 15': true,
  'iPhone 14 Pro Max': true,
  'iPhone 14 Pro': true,
  'iPhone 14 Plus': true,
  'iPhone 14': true,
  'iPhone 13 Pro Max': true,
  'iPhone 13 Pro': true,
  'iPhone 13': true,
  'iPhone 13 mini': true,
  'iPhone 12 Pro Max': true,
  'iPhone 12 Pro': true,
  'iPhone 12': true,
  'iPhone 12 mini': true,
  'iPhone 11 Pro Max': true,
  'iPhone 11 Pro': true,
  'iPhone 11': true,
  'iPhone XS Max': true,
  'iPhone XS': true,
  'iPhone XR': true,
  'iPhone SE (2022)': true,
  'iPhone SE (2020)': true,
  
  // Samsung - 2021 年以后的旗舰机型支持 eSIM
  'Galaxy S24 Ultra': true,
  'Galaxy S24+': true,
  'Galaxy S24': true,
  'Galaxy Z Fold 6': true,
  'Galaxy Z Fold 5': true,
  'Galaxy Z Flip 6': true,
  'Galaxy Z Flip 5': true,
  'Galaxy S23 Ultra': true,
  'Galaxy S23+': true,
  'Galaxy S23': true,
  'Galaxy S23 FE': true,
  'Galaxy Z Fold 4': true,
  'Galaxy Z Flip 4': true,
  'Galaxy S22 Ultra': true,
  'Galaxy S22+': true,
  'Galaxy S22': true,
  'Galaxy Z Fold 3': true,
  'Galaxy Z Flip 3': true,
  'Galaxy S21 Ultra': true,
  'Galaxy S21+': true,
  'Galaxy S21': true,
  'Galaxy S21 FE': true,
  'Galaxy A54': true,
  'Galaxy A53': false,
  'Galaxy A34': false,
  
  // Google - Pixel 3 及以后的机型支持 eSIM
  'Pixel 9 Pro XL': true,
  'Pixel 9 Pro': true,
  'Pixel 9': true,
  'Pixel 8 Pro': true,
  'Pixel 8': true,
  'Pixel 8a': true,
  'Pixel 7 Pro': true,
  'Pixel 7': true,
  'Pixel 7a': true,
  'Pixel 6 Pro': true,
  'Pixel 6': true,
  'Pixel 6a': true,
  'Pixel 5': true,
  'Pixel 4a': true,
  
  // Huawei - 部分机型支持 eSIM（主要是国际版）
  'Pura 70 Ultra': true,
  'Pura 70 Pro': true,
  'Pura 70': true,
  'Mate 60 Pro+': true,
  'Mate 60 Pro': true,
  'Mate 60': true,
  'P60 Pro': true,
  'P60': true,
  'P50 Pro': true,
  'P50': false,
  'Mate 50 Pro': true,
  'Mate 50': false,
  'P40 Pro': true,
  'Mate 40 Pro': true,
  
  // Xiaomi - 2022 年以后的旗舰机型支持 eSIM
  'Xiaomi 14 Ultra': true,
  'Xiaomi 14 Pro': true,
  'Xiaomi 14': true,
  'Xiaomi 13 Ultra': true,
  'Xiaomi 13 Pro': true,
  'Xiaomi 13': true,
  'Xiaomi 12S Ultra': true,
  'Xiaomi 12 Pro': true,
  'Xiaomi 12': true,
  'Xiaomi 11 Ultra': false,
  'Xiaomi 11 Pro': false,
  'Xiaomi 11': false,
  'Redmi Note 13 Pro+': true,
  'Redmi Note 12 Pro+': false,
  
  // OPPO - 2023 年以后的旗舰机型支持 eSIM
  'Find X7 Ultra': true,
  'Find X7 Pro': true,
  'Find X7': true,
  'Find X6 Pro': true,
  'Find X6': true,
  'Find X5 Pro': true,
  'Find X5': false,
  'Reno 11 Pro': true,
  'Reno 10 Pro+': false,
  
  // OnePlus - 2022 年以后的机型支持 eSIM
  'OnePlus 12': true,
  'OnePlus 12R': true,
  'OnePlus 11': true,
  'OnePlus 11R': true,
  'OnePlus 10 Pro': true,
  'OnePlus 10T': true,
  'OnePlus 9 Pro': false,
  'OnePlus 9': false,
};

export default function CompatibilityPage() {
  const { t } = useTranslation();
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [result, setResult] = useState<boolean | null>(null);

  const handleCheck = () => {
    if (selectedModel) {
      setResult(esimCompatibility[selectedModel] || false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* 导航栏 */}
      <nav className="border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              GlobalPass
            </a>
            <div className="flex items-center gap-6">
              <a href="/" className="hover:text-emerald-400 transition-colors">{t('home')}</a>
              <a href="/esim" className="hover:text-emerald-400 transition-colors">{t('esimComparison')}</a>
              <a href="/compatibility" className="text-emerald-400">{t('compatibility')}</a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 页头 */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">📱</div>
          <h1 className="text-4xl font-bold mb-4">{t('checkCompatibility')}</h1>
          <p className="text-slate-300 text-lg">{t('compatibilityCheckDesc')}</p>
        </div>

        {/* 检测表单 */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-2">{t('selectBrand')}</label>
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setSelectedModel('');
                  setResult(null);
                }}
                className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">{t('selectBrand')}</option>
                {Object.keys(phoneData).map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">{t('selectModel')}</label>
              <select
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  setResult(null);
                }}
                disabled={!selectedBrand}
                className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{t('selectModel')}</option>
                {selectedBrand && phoneData[selectedBrand as keyof typeof phoneData]?.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleCheck}
            disabled={!selectedModel}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {t('check')}
          </button>
        </div>

        {/* 检测结果 */}
        {result !== null && (
          <div className={`bg-white/5 backdrop-blur-xl border rounded-2xl p-8 ${
            result ? 'border-emerald-500/50' : 'border-red-500/50'
          }`}>
            <div className="text-center">
              <div className="text-6xl mb-4">{result ? '✅' : '❌'}</div>
              <h2 className="text-2xl font-bold mb-2">
                {result ? t('compatible') : t('notCompatible')}
              </h2>
              <p className="text-slate-300 mb-6">
                {selectedBrand} {selectedModel}
              </p>
              {result ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
                  <p className="text-emerald-400">
                    🎉 {t('compatibleMessage', 'Great! Your phone supports E-SIM. You can start shopping for packages!')}
                  </p>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                  <p className="text-red-400">
                    😔 {t('notCompatibleMessage', 'Unfortunately, this model does not support E-SIM. Please check with your carrier or consider upgrading.')}
                  </p>
                </div>
              )}
              {result && (
                <a
                  href="/esim"
                  className="inline-block px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
                >
                  {t('browsePackages', 'Browse E-SIM Packages')}
                </a>
              )}
            </div>
          </div>
        )}

        {/* 说明 */}
        <div className="mt-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-4">📖 {t('aboutESIM', 'About E-SIM')}</h3>
          <div className="space-y-4 text-slate-300">
            <p>
              {t('esimDescription', 'E-SIM (embedded SIM) is a digital SIM that allows you to activate a cellular plan without using a physical SIM card.')}
            </p>
            <p>
              {t('esimBenefits', 'Benefits: No physical SIM card needed, easy to switch carriers, perfect for international travel, and supports multiple numbers on one device.')}
            </p>
            <p>
              {t('esimRequirements', 'Requirements: Your device must support E-SIM technology, and your carrier must offer E-SIM activation.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
