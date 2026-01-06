/**
 * GlobalPass Homepage
 * 
 * Design concept:
 * - Dark theme background
 * - Green accent color
 * - Modern tech-inspired layout
 */

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Globe, Smartphone, TrendingDown, ArrowRight } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Home() {
  const { t } = useTranslation();
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-emerald-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                {t('common.appName')}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Link href="/esim">
                <Button className="bg-emerald-500 hover:bg-emerald-600">
                  {t('home.hero.cta')} →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Text */}
          <div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {t('home.hero.title')}
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                {t('home.hero.subtitle')}
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              {t('home.hero.description')}
            </p>
            <Link href="/esim">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-lg px-8 py-6">
                {t('home.hero.cta')} <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full"></div>
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-white/10">
              <Globe className="w-full h-64 text-emerald-500 opacity-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-white/10 hover:border-emerald-500/50 transition-all">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
              <Globe className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4">{t('home.features.priceComparison.title')}</h3>
            <p className="text-gray-400">
              {t('home.features.priceComparison.description')}
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-white/10 hover:border-emerald-500/50 transition-all">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
              <Smartphone className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4">{t('home.features.compatibility.title')}</h3>
            <p className="text-gray-400">
              {t('home.features.compatibility.description')}
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-white/10 hover:border-emerald-500/50 transition-all">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
              <TrendingDown className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4">{t('home.features.savings.title')}</h3>
            <p className="text-gray-400">
              {t('home.features.savings.description')}
            </p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-12 border border-white/10">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            {t('home.about.title')}
          </h2>
          <p className="text-xl text-gray-300 mb-6">
            {t('home.about.description')}
          </p>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
            <p className="text-yellow-200">
              {t('home.about.warning')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-emerald-400">{t('home.support.title')}</h3>
              <p className="text-gray-400">
                {t('home.support.description')}
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4 text-emerald-400">{t('home.contact.title')}</h3>
              <p className="text-gray-400 mb-2">{t('home.contact.email')}</p>
              <p className="text-gray-400">{t('home.contact.wechat')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400">
            {t('home.footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
}
