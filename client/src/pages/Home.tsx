/**
 * GlobalPass 首页
 * 
 * 设计理念：
 * - 深色主题背景
 * - 绿色强调色
 * - 现代科技感的布局
 */

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Globe, Smartphone, TrendingDown, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* 导航栏 */}
      <nav className="border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-emerald-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                GlobalPass
              </h1>
            </div>
            <Link href="/esim">
              <Button className="bg-emerald-500 hover:bg-emerald-600">
                进入应用 →
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero 部分 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 左侧文本 */}
          <div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              全球 E-SIM
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                一站式解决方案
              </span>
            </h2>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              GlobalPass 帮助您快速找到最优惠的国际数据套餐，支持全球主要国家，并提供设备兼容性检测，确保您的手机支持 E-SIM 功能。
            </p>

            {/* 功能列表 */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                <span className="text-lg">实时价格对比 - 找到最便宜的套餐</span>
              </div>
              <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                <span className="text-lg">兼容性检测 - 确认您的手机支持</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                <span className="text-lg">全球覆盖 - 支持 180+ 个国家</span>
              </div>
            </div>

            {/* CTA 按钮 */}
            <Link href="/esim">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">
                立即开始 <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* 右侧卡片 */}
          <div className="space-y-6">
            {/* 卡片 1 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold">全球最低价</h3>
              </div>
              <p className="text-slate-300">
                实时聚合全球运营商价格，帮您找到最优惠的 E-SIM 套餐
              </p>
            </div>

            {/* 卡片 2 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold">智能兼容性</h3>
              </div>
              <p className="text-slate-300">
                一键检测您的手机是否支持 E-SIM，避免购买后的麻烦
              </p>
            </div>

            {/* 卡片 3 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold">节省成本</h3>
              </div>
              <p className="text-slate-300">
                对比传统漫游费用，使用 E-SIM 可节省高达 80% 的费用
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 底部信息 */}
      <div className="border-t border-white/10 bg-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-3 text-emerald-400">关于我们</h4>
              <p className="text-slate-400 text-sm">
                GlobalPass 致力于为全球旅行者提供最便捷、最经济的国际数据解决方案
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-emerald-400">支持国家</h4>
              <p className="text-slate-400 text-sm">
                日本、美国、泰国、新加坡、香港、台湾、韩国、澳大利亚等 180+ 个国家和地区
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-emerald-400">联系方式</h4>
              <p className="text-slate-400 text-sm">
                Email: support@globalpass.com
                <br />
                WeChat: GlobalPass_Support
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2024 GlobalPass. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
