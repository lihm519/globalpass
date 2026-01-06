'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface ESIMPackage {
  id: number;
  provider: string;
  country: string;
  plan_name: string;
  data_type: string;
  data_amount: string;
  validity: string;
  price: number;
  network: string;
  link: string;
  last_checked: string;
}

export default function Home() {
  const { t } = useTranslation();
  const [packages, setPackages] = useState<ESIMPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/esim-packages.json')
      .then(res => res.json())
      .then(data => {
        // 数据结构是 { packages: { country: [...] } }
        const allPackages: ESIMPackage[] = [];
        if (data.packages) {
          Object.values(data.packages).forEach((countryPackages: any) => {
            allPackages.push(...countryPackages.slice(0, 2)); // 每个国家取2条
          });
        }
        setPackages(allPackages.slice(0, 10)); // 总共显示10条
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load data:', err);
        setLoading(false);
      });
  }, []);

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
              <a href="/" className="text-emerald-400">{t('home')}</a>
              <a href="/esim" className="hover:text-emerald-400 transition-colors">{t('esimComparison')}</a>
              <a href="/compatibility" className="hover:text-emerald-400 transition-colors">{t('compatibility')}</a>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-2xl text-slate-300">
            {t('subtitle')}
          </p>
        </header>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-bold mb-2">{t('realtimeComparison')}</h2>
            <p className="text-slate-300">{t('realtimeComparisonDesc')}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="text-4xl mb-4">📱</div>
            <h2 className="text-xl font-bold mb-2">{t('compatibilityCheck')}</h2>
            <p className="text-slate-300">{t('compatibilityCheckDesc')}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="text-4xl mb-4">🤖</div>
            <h2 className="text-xl font-bold mb-2">{t('aiAssistant')}</h2>
            <p className="text-slate-300">{t('aiAssistantDesc')}</p>
          </div>
        </div>

        {/* Data Display */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">{t('popularPackages')}</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
              <p className="mt-4 text-slate-400">{t('loading')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">{t('country')}</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">{t('provider')}</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">{t('data')}</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">{t('validity')}</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-semibold">{t('price')}</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg, index) => (
                    <tr key={pkg.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">{pkg.country}</td>
                      <td className="py-3 px-4 text-emerald-400">{pkg.provider}</td>
                      <td className="py-3 px-4">{pkg.data_amount}</td>
                      <td className="py-3 px-4">{pkg.validity}</td>
                      <td className="py-3 px-4 text-right font-semibold">
                        ${pkg.price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-500 text-sm">
          <p>{t('copyright')}</p>
          <p className="mt-2 opacity-50">
            Impact verification: ee6eb054-80e6-4184-9cb0-f2336e37b8ad
          </p>
        </footer>
      </div>
    </div>
  );
}
