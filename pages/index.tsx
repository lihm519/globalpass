import Head from 'next/head';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import AIChatDialog from '@/components/AIChatDialog';

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const [showAIChat, setShowAIChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 热门目的地 - 使用数据文件中的确切国家名称
  const popularDestinations = [
    { name: 'Japan', emoji: '🇯🇵', code: 'Japan' },
    { name: 'USA', emoji: '🇺🇸', code: 'USA' },
    { name: 'Thailand', emoji: '🇹🇭', code: 'Thailand' },
    { name: 'South Korea', emoji: '🇰🇷', code: 'South Korea' },
    { name: 'Singapore', emoji: '🇸🇬', code: 'Singapore' },
    { name: 'UK', emoji: '🇬🇧', code: 'UK' },
    { name: 'Australia', emoji: '🇦🇺', code: 'Australia' },
    { name: 'Hong Kong', emoji: '🇭🇰', code: 'Hong Kong' },
  ];

  // Convert country name to URL slug
  const countryToSlug = (country: string): string => {
    return country.toLowerCase().replace(/\s+/g, '-');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const slug = countryToSlug(searchQuery.trim());
      router.push(`/esim/${slug}`);
    }
  };

  const handleDestinationClick = (country: string) => {
    const slug = countryToSlug(country);
    router.push(`/esim/${slug}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <Head>
        <title>GlobalPass - Compare eSIM Prices for International Travel | Best Data Plans</title>
        <meta name="description" content="Find the cheapest eSIM packages for your trip. Compare real-time prices from Airalo, Nomad, and more. 425+ packages across 20+ countries. Save up to 50% on international data." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        {/* Navigation */}
        <nav className="border-b border-white/10 backdrop-blur-md bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-4xl">🌍</div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                  GlobalPass
                </h1>
              </div>
              <div className="flex items-center gap-6">
                <a href="/esim/japan" className="hidden md:block hover:text-emerald-400 transition-colors">
                  {t('esimComparison', 'eSIM Comparison')}
                </a>
                <a href="/compatibility" className="hidden md:block hover:text-emerald-400 transition-colors">
                  {t('compatibility', 'Compatibility')}
                </a>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
            <div className="text-center space-y-8">
              <h2 className="text-5xl md:text-7xl font-bold leading-tight">
                {t('heroTitle', 'Find the')}
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                  {t('heroTitleHighlight', 'Cheapest eSIM')}
                </span>
                <br />
                {t('heroTitleEnd', 'for Your Trip')}
              </h2>
              <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
                {t('heroSubtitle', 'Compare real-time prices from multiple providers. 425+ packages across 20+ countries.')}
              </p>

              {/* Search Bar */}
              <div className="max-w-3xl mx-auto group">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter country name (e.g., Japan, USA, Thailand)..."
                    className="w-full px-8 py-6 text-lg md:text-xl bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all placeholder-slate-400 text-white group-hover:border-white/30"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all hover:scale-105 active:scale-95"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* 辅助链接 */}
              <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
                <a 
                  href="/compatibility" 
                  className="hover:text-emerald-400 transition-colors flex items-center gap-2"
                >
                  <span>📱</span>
                  <span>Check Phone Compatibility</span>
                </a>
                <span className="text-slate-600">•</span>
                <button
                  onClick={() => setShowAIChat(true)}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-2"
                >
                  <span>🤖</span>
                  <span>Ask AI Assistant</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Destinations */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Popular Destinations
            </span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {popularDestinations.map((destination) => (
              <button
                key={destination.code}
                onClick={() => handleDestinationClick(destination.code)}
                className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-emerald-500/50 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300"
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                  {destination.emoji}
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                  {destination.name}
                </h3>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:to-transparent transition-all pointer-events-none"></div>
              </button>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="text-5xl">⚡</div>
              <h3 className="text-xl font-bold">{t('realtimeComparison', 'Real-time Comparison')}</h3>
              <p className="text-slate-400">{t('realtimeComparisonDesc', 'Compare prices from multiple providers instantly')}</p>
            </div>
            <div className="text-center space-y-4">
              <div className="text-5xl">💰</div>
              <h3 className="text-xl font-bold">Best Price Guarantee</h3>
              <p className="text-slate-400">Find the cheapest eSIM packages for your destination</p>
            </div>
            <div className="text-center space-y-4">
              <div className="text-5xl">🌍</div>
              <h3 className="text-xl font-bold">Global Coverage</h3>
              <p className="text-slate-400">425+ packages across 20+ countries worldwide</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 mt-16 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
            <p>{t('copyright', '© 2026 GlobalPass. All rights reserved.')}</p>
            <p className="mt-2 opacity-50">
              Impact verification: ee6eb054-80e6-4184-9cb0-f2336e37b8ad
            </p>
          </div>
        </footer>

        {/* AI Chat Dialog */}
        <AIChatDialog isOpen={showAIChat} onClose={() => setShowAIChat(false)} />

        {/* Floating AI Button */}
        <button
          onClick={() => setShowAIChat(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl transition-all hover:scale-110 z-40 animate-pulse hover:animate-none"
          aria-label="Open AI Assistant"
        >
          🤖
        </button>
      </div>
    </>
  );
}
