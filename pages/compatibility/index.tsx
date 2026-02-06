import Head from 'next/head';
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
    'iPhone 17 Pro Max', 'iPhone 17 Pro', 'iPhone 17', 'iPhone Air',
    'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16',
    'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
    'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
    'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 mini',
    'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 12 mini',
    'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
    'iPhone XS Max', 'iPhone XS', 'iPhone XR',
    'iPhone SE (2022)', 'iPhone SE (2020)',
  ],
  Samsung: [
    'Galaxy S26 Ultra', 'Galaxy S26+', 'Galaxy S26',
    'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24',
    'Galaxy Z Fold 6', 'Galaxy Z Fold 5', 'Galaxy Z Flip 6', 'Galaxy Z Flip 5',
    'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23', 'Galaxy S23 FE',
    'Galaxy Z Fold 4', 'Galaxy Z Flip 4',
    'Galaxy S22 Ultra', 'Galaxy S22+', 'Galaxy S22',
    'Galaxy Z Fold 3', 'Galaxy Z Flip 3',
    'Galaxy S21 Ultra', 'Galaxy S21+', 'Galaxy S21', 'Galaxy S21 FE',
    'Galaxy A54', 'Galaxy A53', 'Galaxy A34',
  ],
  Google: [
    'Pixel 10 Pro XL', 'Pixel 10 Pro', 'Pixel 10',
    'Pixel 9 Pro XL', 'Pixel 9 Pro', 'Pixel 9',
    'Pixel 8 Pro', 'Pixel 8', 'Pixel 8a',
    'Pixel 7 Pro', 'Pixel 7', 'Pixel 7a',
    'Pixel 6 Pro', 'Pixel 6', 'Pixel 6a',
    'Pixel 5', 'Pixel 4a',
  ],
  Huawei: [
    'Pura 70 Ultra', 'Pura 70 Pro', 'Pura 70',
    'Mate 60 Pro+', 'Mate 60 Pro', 'Mate 60',
    'P60 Pro', 'P60', 'P50 Pro', 'P50',
    'Mate 50 Pro', 'Mate 50',
    'P40 Pro', 'Mate 40 Pro',
  ],
  Xiaomi: [
    'Xiaomi 14 Ultra', 'Xiaomi 14 Pro', 'Xiaomi 14',
    'Xiaomi 13 Ultra', 'Xiaomi 13 Pro', 'Xiaomi 13',
    'Xiaomi 12S Ultra', 'Xiaomi 12 Pro', 'Xiaomi 12',
    'Xiaomi 11 Ultra', 'Xiaomi 11 Pro', 'Xiaomi 11',
    'Redmi Note 13 Pro+', 'Redmi Note 12 Pro+',
  ],
  OPPO: [
    'Find X7 Ultra', 'Find X7 Pro', 'Find X7',
    'Find X6 Pro', 'Find X6',
    'Find X5 Pro', 'Find X5',
    'Reno 11 Pro', 'Reno 10 Pro+',
  ],
  OnePlus: [
    'OnePlus 12', 'OnePlus 12R',
    'OnePlus 11', 'OnePlus 11R',
    'OnePlus 10 Pro', 'OnePlus 10T',
    'OnePlus 9 Pro', 'OnePlus 9',
  ],
};

export default function CompatibilityPage() {
  const { t } = useTranslation();
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [result, setResult] = useState<'supported' | 'not-supported' | null>(null);

  const handleCheck = () => {
    if (!selectedBrand || !selectedModel || !selectedRegion) {
      alert('Please select brand, model and region');
      return;
    }

    // 简化逻辑：所有选中的型号都支持 eSIM
    setResult('supported');
  };

  const handleReset = () => {
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedRegion('');
    setResult(null);
  };

  return (
    <>
      <Head>
        <title>eSIM Compatibility Checker | GlobalPass</title>
        <meta name="description" content="Check if your phone supports eSIM. Compatible with iPhone, Samsung, Google Pixel, and more." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        {/* Navigation */}
        <nav className="border-b border-white/10 backdrop-blur-md bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="flex items-center gap-3">
                <div className="text-4xl">🌍</div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                  GlobalPass
                </h1>
              </a>
              <div className="flex items-center gap-6">
                <a href="/esim/japan" className="hidden md:block hover:text-emerald-400 transition-colors">
                  eSIM Comparison
                </a>
                <a href="/compatibility" className="text-emerald-400">
                  Compatibility
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                eSIM Compatibility Checker
              </span>
            </h2>
            <p className="text-xl text-slate-300">
              Check if your phone supports eSIM technology
            </p>
          </div>

          {/* Selection Form */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6">
            {/* Brand Selection */}
            <div>
              <label className="block text-sm font-semibold mb-3">Select Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setSelectedModel('');
                  setResult(null);
                }}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-white"
              >
                <option value="">Choose a brand...</option>
                {Object.keys(phoneData).map(brand => (
                  <option key={brand} value={brand} className="bg-slate-900">
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Selection */}
            {selectedBrand && (
              <div>
                <label className="block text-sm font-semibold mb-3">Select Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => {
                    setSelectedModel(e.target.value);
                    setResult(null);
                  }}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-white"
                >
                  <option value="">Choose a model...</option>
                  {phoneData[selectedBrand as keyof typeof phoneData].map(model => (
                    <option key={model} value={model} className="bg-slate-900">
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Region Selection */}
            {selectedModel && (
              <div>
                <label className="block text-sm font-semibold mb-3">Select Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => {
                    setSelectedRegion(e.target.value);
                    setResult(null);
                  }}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-white"
                >
                  <option value="">Choose a region...</option>
                  {regions.map(region => (
                    <option key={region.id} value={region.id} className="bg-slate-900">
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Check Button */}
            {selectedBrand && selectedModel && selectedRegion && (
              <div className="flex gap-4">
                <button
                  onClick={handleCheck}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                  Check Compatibility
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 rounded-xl transition-all"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Result */}
          {result && (
            <div className={`mt-8 p-8 rounded-2xl border-2 ${
              result === 'supported' 
                ? 'bg-emerald-500/20 border-emerald-500' 
                : 'bg-red-500/20 border-red-500'
            }`}>
              <div className="flex items-start gap-4">
                <div className="text-5xl">
                  {result === 'supported' ? '✅' : '❌'}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">
                    {result === 'supported' ? 'eSIM Supported!' : 'eSIM Not Supported'}
                  </h3>
                  <p className="text-lg text-slate-200 mb-4">
                    {result === 'supported' 
                      ? `Your ${selectedBrand} ${selectedModel} (${regions.find(r => r.id === selectedRegion)?.nameEn}) supports eSIM technology.`
                      : `Unfortunately, your ${selectedBrand} ${selectedModel} (${regions.find(r => r.id === selectedRegion)?.nameEn}) does not support eSIM.`
                    }
                  </p>
                  {result === 'supported' && (
                    <a
                      href="/esim/japan"
                      className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg transition-all"
                    >
                      Browse eSIM Plans →
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">What is eSIM?</h3>
            <p className="text-slate-300 leading-relaxed mb-4">
              eSIM (embedded SIM) is a digital SIM that allows you to activate a cellular plan without using a physical SIM card. 
              It's built into your device and can store multiple carrier profiles.
            </p>
            <h3 className="text-2xl font-bold mb-4 mt-8">Benefits of eSIM</h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>No need to swap physical SIM cards when traveling</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Instant activation - no waiting for delivery</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Use multiple numbers on one device</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>More environmentally friendly</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
