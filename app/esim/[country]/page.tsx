import Script from 'next/script';

// Force static export - generate real HTML instead of RSC JSON
export const dynamic = 'force-static';
export const dynamicParams = false;

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

interface PackageData {
  packages: Record<string, ESIMPackage[]>;
}

// Normalize country name from URL slug to display name
function normalizeCountryName(slug: string): string {
  // Convert slug to title case (e.g., 'hong-kong' -> 'Hong Kong')
  const titleCase = slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
  
  // Special cases that don't follow title case
  const specialCases: Record<string, string> = {
    'Usa': 'USA',
    'Uk': 'UK',
  };
  
  return specialCases[titleCase] || titleCase;
}

// Convert country name to slug
function countryToSlug(country: string): string {
  return country.toLowerCase().replace(/\s+/g, '-');
}

// Generate static params for all countries at build time
export async function generateStaticParams() {
  // Import JSON data at build time
  const packageData: PackageData = await import('@/public/data/esim-packages.json').then(m => m.default);
  
  const countries = Object.keys(packageData.packages);
  
  return countries.map(country => ({
    country: countryToSlug(country)
  }));
}

// Server-side data fetching for static generation
async function getCountryPackages(country: string): Promise<ESIMPackage[]> {
  const packageData: PackageData = await import('@/public/data/esim-packages.json').then(m => m.default);
  const countryName = normalizeCountryName(country);
  return packageData.packages[countryName] || [];
}

export default async function CountryESIMPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const countryName = normalizeCountryName(country);
  const packages = await getCountryPackages(country);
  
  // Calculate cheapest package
  const cheapestPackage = packages.length > 0 
    ? packages.reduce((min, pkg) => pkg.price < min.price ? pkg : min)
    : null;
  
  // Calculate price range for JSON-LD
  const priceRange = packages.length > 0 ? {
    low: Math.min(...packages.map(p => p.price)),
    high: Math.max(...packages.map(p => p.price))
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* JSON-LD Structured Data for SEO */}
      {packages.length > 0 && priceRange && (
        <Script
          id="country-product-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": `${countryName} eSIM Data Plans`,
              "description": `Compare ${packages.length} eSIM data plans for ${countryName}. Find the cheapest international data packages from multiple providers.`,
              "brand": {
                "@type": "Brand",
                "name": "GlobalPass"
              },
              "offers": {
                "@type": "AggregateOffer",
                "lowPrice": priceRange.low.toFixed(2),
                "highPrice": priceRange.high.toFixed(2),
                "priceCurrency": "USD",
                "offerCount": packages.length,
                "availability": "https://schema.org/InStock"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.5",
                "reviewCount": packages.length
              }
            })
          }}
        />
      )}

      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              GlobalPass
            </a>
            <div className="flex items-center gap-6">
              <a href="/" className="hover:text-emerald-400 transition-colors">Home</a>
              <a href="/esim" className="text-emerald-400">eSIM Comparison</a>
              <a href="/compatibility" className="hover:text-emerald-400 transition-colors">Compatibility</a>
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
          <h1 className="text-4xl font-bold mb-4">{countryName} eSIM Plans</h1>
          <p className="text-slate-300 text-lg">
            Compare {packages.length} eSIM data plans for {countryName}. All prices in USD.
          </p>
        </div>

        {/* Package Grid */}
        {packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => {
              const isCheapest = cheapestPackage && pkg.id === cheapestPackage.id;
              
              return (
                <div 
                  key={pkg.id} 
                  className={`bg-slate-800/50 border rounded-xl p-6 hover:border-emerald-500/50 transition-all relative ${
                    isCheapest ? 'border-emerald-500 ring-2 ring-emerald-500/50' : 'border-white/10'
                  }`}
                >
                  {isCheapest && (
                    <div className="absolute -top-3 left-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      BEST VALUE
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
                      <span className="text-slate-400">Data:</span>
                      <span className="font-semibold">{pkg.data_amount}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-400">Validity:</span>
                      <span className="font-semibold">{pkg.validity}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-400">Network:</span>
                      <span className="font-semibold">{pkg.network}</span>
                    </div>
                  </div>
                  
                  <a
                    href={pkg.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                      isCheapest 
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    View Deal →
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/5 rounded-2xl">
            <p className="text-slate-400 text-lg">No packages available for {countryName} yet.</p>
            <a href="/esim" className="inline-block mt-4 text-emerald-400 hover:text-emerald-300">
              View all countries →
            </a>
          </div>
        )}

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
