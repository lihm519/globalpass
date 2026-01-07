'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'next/navigation';
import '@/lib/i18n';

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

export default function ESIMPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [packages, setPackages] = useState<ESIMPackage[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<ESIMPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    fetch('/data/esim-packages.json')
      .then(res => res.json())
      .then(data => {
        const allPackages: ESIMPackage[] = [];
        const countryList: string[] = [];
        
        if (data.packages) {
          Object.entries(data.packages).forEach(([country, countryPackages]: [string, any]) => {
            countryList.push(country);
            allPackages.push(...countryPackages);
          });
        }
        
        setPackages(allPackages);
        setFilteredPackages(allPackages);
        setCountries(countryList.sort());
        setLoading(false);
        
        // 读取 URL 参数并设置初始国家
        const countryParam = searchParams.get('country');
        if (countryParam) {
          const normalizedParam = countryParam.toLowerCase();
          // 尝试匹配国家名称（不区分大小写）
          const matchedCountry = countryList.find(
            country => country.toLowerCase() === normalizedParam
          );
          if (matchedCountry) {
            setSelectedCountry(matchedCountry);
          }
        }
      })
      .catch(err => {
        console.error('Failed to load data:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedCountry === 'all') {
      setFilteredPackages(packages);
    } else {
      setFilteredPackages(packages.filter(pkg => pkg.country === selectedCountry));
    }
  }, [selectedCountry, packages]);

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
              <a href="/esim" className="text-emerald-400">{t('esimComparison')}</a>
              <a href="/compatibility" className="hover:text-emerald-400 transition-colors">{t('compatibility')}</a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 页头 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{t('esimComparison')}</h1>
          <p className="text-slate-300 text-lg">{t('realtimeComparisonDesc')}</p>
        </div>

        {/* 筛选器 */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">{t('selectCountry')}</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">{t('allCountries')}</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 套餐列表 */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">
            {selectedCountry === 'all' ? t('popularPackages') : `${selectedCountry} ${t('popularPackages')}`}
            <span className="ml-3 text-lg text-slate-400">({filteredPackages.length} {t('packages', '套餐')})</span>
          </h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
              <p className="mt-4 text-slate-400">{t('loading')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map((pkg) => (
                <div key={pkg.id} className="bg-slate-800/50 border border-white/10 rounded-xl p-6 hover:border-emerald-500/50 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{pkg.country}</h3>
                      <p className="text-emerald-400 text-sm">{pkg.provider}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${pkg.price.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-400">{t('data')}:</span>
                      <span className="font-semibold">{pkg.data_amount}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-400">{t('validity')}:</span>
                      <span className="font-semibold">{pkg.validity}</span>
                    </div>
                  </div>
                  
                  <a
                    href={pkg.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    {t('buyNow')}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
