'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
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

// Normalize country name from URL slug to display name
function normalizeCountryName(slug: string): string {
  const mapping: Record<string, string> = {
    'japan': 'Japan',
    'south-korea': 'South Korea',
    'thailand': 'Thailand',
    'singapore': 'Singapore',
    'hong-kong': 'Hong Kong',
    'taiwan': 'Taiwan',
    'malaysia': 'Malaysia',
    'indonesia': 'Indonesia',
    'philippines': 'Philippines',
    'vietnam': 'Vietnam',
    'usa': 'USA',
    'uk': 'UK',
    'france': 'France',
    'germany': 'Germany',
    'italy': 'Italy',
    'spain': 'Spain',
    'australia': 'Australia',
    'canada': 'Canada',
    'india': 'India',
    'china': 'China'
  };
  
  return mapping[slug.toLowerCase()] || slug;
}

// Convert display name to URL slug
export function countryToSlug(country: string): string {
  return country.toLowerCase().replace(/\s+/g, '-');
}

function CountryESIMContent() {
  const params = useParams();
  const { t } = useTranslation();
  const countrySlug = params.country as string;
  const countryName = normalizeCountryName(countrySlug);
  
  const [packages, setPackages] = useState<ESIMPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [cheapestPackage, setCheapestPackage] = useState<ESIMPackage | null>(null);

  useEffect(() => {
    fetch('/data/esim-packages.json')
      .then(res => res.json())
      .then(data => {
        if (data.packages && data.packages[countryName]) {
          const countryPackages = data.packages[countryName];
          setPackages(countryPackages);
          
          // Find cheapest package
          if (countryPackages.length > 0) {
            const cheapest = countryPackages.reduce((min: ESIMPackage, pkg: ESIMPackage) => 
              pkg.price < min.price ? pkg : min
            );
            setCheapestPackage(cheapest);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load data:', err);
        setLoading(false);
      });
  }, [countryName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
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
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Country Not Found</h1>
          <p className="text-slate-300 mb-8">We don't have eSIM packages for "{countryName}" yet.</p>
          <a href="/esim" className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
            View All Countries
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
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
        {/* Answer Block - Featured at the top */}
        {cheapestPackage && (
          <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border-2 border-emerald-500/50 rounded-2xl p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">Best eSIM Deal for {countryName}</h2>
                <p className="text-lg text-slate-200 leading-relaxed">
                  The cheapest eSIM for <span className="font-semibold text-emerald-400">{countryName}</span> is{' '}
                  <span className="font-semibold text-emerald-400">{cheapestPackage.provider}</span> at{' '}
                  <span className="font-bold text-2xl text-white">${cheapestPackage.price.toFixed(2)}</span> for{' '}
                  <span className="font-semibold">{cheapestPackage.data_amount}</span> valid for{' '}
                  <span className="font-semibold">{cheapestPackage.validity}</span>.
                </p>
                <a
                  href={cheapestPackage.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg"
                >
                  Get This Deal →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{countryName} eSIM Packages</h1>
          <p className="text-slate-300 text-lg">
            Compare {packages.length} eSIM packages for {countryName} from multiple providers
          </p>
        </div>

        {/* Packages Grid */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">
            Available Packages
            <span className="ml-3 text-lg text-slate-400">({packages.length} options)</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div 
                key={pkg.id} 
                className={`bg-slate-800/50 border rounded-xl p-6 hover:border-emerald-500/50 transition-all ${
                  pkg.id === cheapestPackage?.id ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-white/10'
                }`}
              >
                {pkg.id === cheapestPackage?.id && (
                  <div className="mb-3">
                    <span className="inline-block bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      BEST VALUE
                    </span>
                  </div>
                )}
                
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
        </div>

        {/* Back to all countries */}
        <div className="mt-8 text-center">
          <a 
            href="/esim" 
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            View All Countries
          </a>
        </div>
      </div>
    </div>
  );
}

export default function CountryESIMPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      </div>
    }>
      <CountryESIMContent />
    </Suspense>
  );
}
