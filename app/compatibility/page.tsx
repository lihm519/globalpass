'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

// 手机品牌和型号数据
const phoneData = {
  Apple: [
    'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
    'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 mini',
    'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 12 mini',
    'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
    'iPhone XS Max', 'iPhone XS', 'iPhone XR',
  ],
  Samsung: [
    'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23',
    'Galaxy S22 Ultra', 'Galaxy S22+', 'Galaxy S22',
    'Galaxy S21 Ultra', 'Galaxy S21+', 'Galaxy S21',
    'Galaxy Z Fold 4', 'Galaxy Z Fold 3', 'Galaxy Z Flip 4', 'Galaxy Z Flip 3',
  ],
  Google: [
    'Pixel 7 Pro', 'Pixel 7', 'Pixel 6 Pro', 'Pixel 6', 'Pixel 5',
  ],
  Huawei: [
    'P50 Pro', 'P40 Pro', 'Mate 40 Pro', 'Mate 30 Pro',
  ],
  Xiaomi: [
    'Mi 13 Pro', 'Mi 12 Pro', 'Mi 11 Ultra', 'Mi 11 Pro',
  ],
};

// E-SIM 兼容性数据（简化版）
const esimCompatibility: Record<string, boolean> = {
  // Apple
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
  
  // Samsung
  'Galaxy S23 Ultra': true,
  'Galaxy S23+': true,
  'Galaxy S23': true,
  'Galaxy S22 Ultra': true,
  'Galaxy S22+': true,
  'Galaxy S22': true,
  'Galaxy S21 Ultra': true,
  'Galaxy S21+': true,
  'Galaxy S21': true,
  'Galaxy Z Fold 4': true,
  'Galaxy Z Fold 3': true,
  'Galaxy Z Flip 4': true,
  'Galaxy Z Flip 3': true,
  
  // Google
  'Pixel 7 Pro': true,
  'Pixel 7': true,
  'Pixel 6 Pro': true,
  'Pixel 6': true,
  'Pixel 5': true,
  
  // Huawei
  'P50 Pro': true,
  'P40 Pro': true,
  'Mate 40 Pro': true,
  'Mate 30 Pro': false,
  
  // Xiaomi
  'Mi 13 Pro': true,
  'Mi 12 Pro': true,
  'Mi 11 Ultra': false,
  'Mi 11 Pro': false,
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
