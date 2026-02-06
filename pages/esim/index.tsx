import Head from 'next/head';
import { GetStaticProps } from 'next';
import packageData from '@/public/data/esim-packages.json';

interface PackageData {
  packages: Record<string, any[]>;
}

interface PageProps {
  countries: Array<{
    name: string;
    slug: string;
    packageCount: number;
    minPrice: number;
  }>;
}

// Convert country name to URL slug
function countryToSlug(country: string): string {
  return country.toLowerCase().replace(/\s+/g, '-');
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const data = packageData as PackageData;
  
  const countries = Object.entries(data.packages).map(([country, packages]) => ({
    name: country,
    slug: countryToSlug(country),
    packageCount: packages.length,
    minPrice: Math.min(...packages.map((pkg: any) => pkg.price))
  })).sort((a, b) => a.name.localeCompare(b.name));
  
  return {
    props: {
      countries
    }
  };
};

export default function ESIMListPage({ countries }: PageProps) {
  return (
    <>
      <Head>
        <title>eSIM Plans by Country | GlobalPass</title>
        <meta name="description" content="Compare eSIM data plans for international travel. Find the best prices across 20+ countries." />
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
                <a href="/esim" className="text-emerald-400">
                  eSIM Comparison
                </a>
                <a href="/compatibility" className="hover:text-emerald-400 transition-colors">
                  Compatibility
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                eSIM Plans by Country
              </span>
            </h2>
            <p className="text-xl text-slate-300">
              Compare prices from multiple providers across {countries.length} countries
            </p>
          </div>

          {/* Country Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {countries.map((country) => (
              <a
                key={country.slug}
                href={`/esim/${country.slug}`}
                className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-emerald-500/50 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold group-hover:text-emerald-400 transition-colors">
                    {country.name}
                  </h3>
                  <div className="text-3xl">
                    {country.name === 'Japan' && '🇯🇵'}
                    {country.name === 'USA' && '🇺🇸'}
                    {country.name === 'Thailand' && '🇹🇭'}
                    {country.name === 'South Korea' && '🇰🇷'}
                    {country.name === 'Singapore' && '🇸🇬'}
                    {country.name === 'UK' && '🇬🇧'}
                    {country.name === 'Australia' && '🇦🇺'}
                    {country.name === 'Hong Kong' && '🇭🇰'}
                    {country.name === 'Taiwan' && '🇹🇼'}
                    {country.name === 'Germany' && '🇩🇪'}
                    {country.name === 'France' && '🇫🇷'}
                    {country.name === 'Italy' && '🇮🇹'}
                    {country.name === 'Spain' && '🇪🇸'}
                    {country.name === 'Canada' && '🇨🇦'}
                    {country.name === 'Mexico' && '🇲🇽'}
                    {country.name === 'Brazil' && '🇧🇷'}
                    {country.name === 'India' && '🇮🇳'}
                    {country.name === 'Indonesia' && '🇮🇩'}
                    {country.name === 'Vietnam' && '🇻🇳'}
                    {country.name === 'Malaysia' && '🇲🇾'}
                    {!['Japan', 'USA', 'Thailand', 'South Korea', 'Singapore', 'UK', 'Australia', 'Hong Kong', 'Taiwan', 'Germany', 'France', 'Italy', 'Spain', 'Canada', 'Mexico', 'Brazil', 'India', 'Indonesia', 'Vietnam', 'Malaysia'].includes(country.name) && '🌍'}
                  </div>
                </div>
                
                <div className="space-y-2 text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Available Plans:</span>
                    <span className="font-semibold">{country.packageCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Starting from:</span>
                    <span className="text-2xl font-bold text-emerald-400">
                      ${country.minPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm text-slate-400 group-hover:text-emerald-400 transition-colors">
                  <span>View all plans</span>
                  <span>→</span>
                </div>
              </a>
            ))}
          </div>

          {/* Info Section */}
          <div className="mt-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">Why Choose GlobalPass?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl mb-3">⚡</div>
                <h4 className="text-lg font-semibold mb-2">Real-time Comparison</h4>
                <p className="text-slate-400">
                  Compare prices from multiple providers instantly and find the best deal
                </p>
              </div>
              <div>
                <div className="text-4xl mb-3">💰</div>
                <h4 className="text-lg font-semibold mb-2">Best Price Guarantee</h4>
                <p className="text-slate-400">
                  We track prices across providers to ensure you get the cheapest option
                </p>
              </div>
              <div>
                <div className="text-4xl mb-3">🌍</div>
                <h4 className="text-lg font-semibold mb-2">Global Coverage</h4>
                <p className="text-slate-400">
                  425+ packages across 20+ countries with instant activation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
