'use client';

import { useEffect, useState, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';
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

// Convert country name to URL slug
function countryToSlug(country: string): string {
  return country.toLowerCase().replace(/\s+/g, '-');
}

function ESIMContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
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
        
        // 读取 URL 参数并重定向到 SEO 友好的 URL
        const countryParam = searchParams.get('country');
        if (countryParam) {
          const normalizedParam = countryParam.toLowerCase();
          // 尝试匹配国家名称（不区分大小写）
          const matchedCountry = countryList.find(
            country => country.toLowerCase() === normalizedParam
          );
          if (matchedCountry) {
            // 重定向到新的 SEO 友好 URL
            const slug = countryToSlug(matchedCountry);
            router.replace(`/esim/${slug}`);
            return; // 停止执行，等待重定向
          }
        }
      })
      .catch(err => {
        console.error('Failed to load data:', err);
        setLoading(false);
      });
  }, [searchParams]);

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
                  {/* Product Schema 已移除：GlobalPass 是比价平台，不是直接销售商，不应使用 Merchant Listing 标记 */}
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
          
          {/* 隐藏的 HTML 表格供 AI 爬虫抓取（不影响用户体验） */}
          {!loading && filteredPackages.length > 0 && (
            <div className="sr-only" aria-hidden="true">
              <table>
                <caption>eSIM Package Comparison Table for AI Crawlers</caption>
                <thead>
                  <tr>
                    <th>Country</th>
                    <th>Provider</th>
                    <th>Data Amount</th>
                    <th>Validity Period</th>
                    <th>Price (USD)</th>
                    <th>Network</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPackages.map((pkg) => (
                    <tr key={`table-${pkg.id}`}>
                      <td>{pkg.country}</td>
                      <td>{pkg.provider}</td>
                      <td>{pkg.data_amount}</td>
                      <td>{pkg.validity}</td>
                      <td>${pkg.price.toFixed(2)}</td>
                      <td>{pkg.network}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* FAQ 组件 */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mt-8">
          <h2 className="text-3xl font-bold mb-8 text-center">{t('faq', 'Frequently Asked Questions')}</h2>
          
          {/* FAQPage Schema for GEO */}
          <Script
            id="faq-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "What countries does GlobalPass support?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "GlobalPass supports eSIM packages for 20+ countries including USA, Japan, Thailand, South Korea, Singapore, UK, Australia, Hong Kong, and many more. We compare prices from multiple providers like Airalo and Nomad to help you find the best deal."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "How do I activate an eSIM?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "After purchasing an eSIM package, you'll receive a QR code via email. Simply scan the QR code with your phone's camera, follow the on-screen instructions, and your eSIM will be activated. Make sure your device supports eSIM before purchasing."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "What is the price range for eSIM packages?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "eSIM packages on GlobalPass range from $4.50 to $99.00 USD, depending on the country, data amount, and validity period. We offer 425+ packages to choose from, ensuring you find the best value for your travel needs."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Can I use eSIM on my phone?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Most modern smartphones support eSIM, including iPhone XS and later, Samsung Galaxy S20 and later, Google Pixel 3 and later. Check our compatibility page to verify if your specific phone model supports eSIM."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Is GlobalPass affiliated with Eurail Global Pass or Visible Global Pass?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "No, GlobalPass is an independent eSIM price comparison platform. We are not affiliated with Eurail Global Pass (European train pass) or Visible Global Pass (telecom roaming package). We focus exclusively on comparing international eSIM data plans for travelers."
                    }
                  }
                ]
              })
            }}
          />
          
          <div className="space-y-6">
            {/* FAQ 1 */}
            <div className="border-b border-white/10 pb-6">
              <h3 className="text-xl font-semibold mb-3">{t('faqCountries', 'What countries does GlobalPass support?')}</h3>
              <p className="text-slate-300">
                {t('faqCountriesAnswer', 'GlobalPass supports eSIM packages for 20+ countries including USA, Japan, Thailand, South Korea, Singapore, UK, Australia, Hong Kong, and many more. We compare prices from multiple providers like Airalo and Nomad to help you find the best deal.')}
              </p>
            </div>
            
            {/* FAQ 2 */}
            <div className="border-b border-white/10 pb-6">
              <h3 className="text-xl font-semibold mb-3">{t('faqActivation', 'How do I activate an eSIM?')}</h3>
              <p className="text-slate-300">
                {t('faqActivationAnswer', 'After purchasing an eSIM package, you\'ll receive a QR code via email. Simply scan the QR code with your phone\'s camera, follow the on-screen instructions, and your eSIM will be activated. Make sure your device supports eSIM before purchasing.')}
              </p>
            </div>
            
            {/* FAQ 3 */}
            <div className="border-b border-white/10 pb-6">
              <h3 className="text-xl font-semibold mb-3">{t('faqPrice', 'What is the price range for eSIM packages?')}</h3>
              <p className="text-slate-300">
                {t('faqPriceAnswer', 'eSIM packages on GlobalPass range from $4.50 to $99.00 USD, depending on the country, data amount, and validity period. We offer 425+ packages to choose from, ensuring you find the best value for your travel needs.')}
              </p>
            </div>
            
            {/* FAQ 4 */}
            <div className="border-b border-white/10 pb-6">
              <h3 className="text-xl font-semibold mb-3">{t('faqCompatibility', 'Can I use eSIM on my phone?')}</h3>
              <p className="text-slate-300">
                {t('faqCompatibilityAnswer', 'Most modern smartphones support eSIM, including iPhone XS and later, Samsung Galaxy S20 and later, Google Pixel 3 and later. Check our compatibility page to verify if your specific phone model supports eSIM.')}
              </p>
            </div>
            
            {/* FAQ 5 - 品牌消歧 */}
            <div className="pb-6">
              <h3 className="text-xl font-semibold mb-3">{t('faqAffiliation', 'Is GlobalPass affiliated with Eurail Global Pass or Visible Global Pass?')}</h3>
              <p className="text-slate-300">
                {t('faqAffiliationAnswer', 'No, GlobalPass is an independent eSIM price comparison platform. We are not affiliated with Eurail Global Pass (European train pass) or Visible Global Pass (telecom roaming package). We focus exclusively on comparing international eSIM data plans for travelers.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ESIMPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      </div>
    }>
      <ESIMContent />
    </Suspense>
  );
}
