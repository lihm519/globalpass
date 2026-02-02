'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import AIChatDialog from '@/components/AIChatDialog';

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const [showAIChat, setShowAIChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 热门目的地
  const popularDestinations = [
    { name: 'Japan', emoji: '🇯🇵', code: 'japan' },
    { name: 'USA', emoji: '🇺🇸', code: 'usa' },
    { name: 'Thailand', emoji: '🇹🇭', code: 'thailand' },
    { name: 'South Korea', emoji: '🇰🇷', code: 'korea' },
    { name: 'Singapore', emoji: '🇸🇬', code: 'singapore' },
    { name: 'UK', emoji: '🇬🇧', code: 'uk' },
    { name: 'Australia', emoji: '🇦🇺', code: 'australia' },
    { name: 'Hong Kong', emoji: '🇭🇰', code: 'hong kong' },
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/esim?country=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleDestinationClick = (country: string) => {
    router.push(`/esim?country=${encodeURIComponent(country)}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* 导航栏 */}
      <nav className="border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-30">
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

      {/* Hero Section - 搜索引擎风格 */}
      <section className="relative flex flex-col items-center justify-center px-4" style={{ minHeight: '60vh' }}>
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-4xl text-center space-y-8">
          {/* 主标题 */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent">
              Find the Best eSIM
            </span>
            <br />
            <span className="text-white">for Your Trip</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 mb-12">
            {t('subtitle', 'Compare prices from Airalo, Nomad, and more')}
          </p>

          {/* 巨大的搜索框 */}
          <div className="w-full max-w-3xl mx-auto">
            <div className="relative group">
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
      </section>

      {/* Popular Destinations - 替换表格 */}
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
  );
}
