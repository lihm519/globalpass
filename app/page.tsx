'use client';

import { useEffect, useState } from 'react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            GlobalPass
          </h1>
          <p className="text-2xl text-slate-300">
            全球 E-SIM 比价与手机兼容性检测
          </p>
        </header>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-bold mb-2">实时比价</h2>
            <p className="text-slate-300">对比 20+ 国家的 E-SIM 套餐价格</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="text-4xl mb-4">📱</div>
            <h2 className="text-xl font-bold mb-2">兼容性检测</h2>
            <p className="text-slate-300">一键检测您的手机是否支持 E-SIM</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="text-4xl mb-4">🤖</div>
            <h2 className="text-xl font-bold mb-2">AI 导购助手</h2>
            <p className="text-slate-300">智能推荐最适合您的套餐</p>
          </div>
        </div>

        {/* Data Display */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">热门套餐</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
              <p className="mt-4 text-slate-400">加载中...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">国家</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">提供商</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">流量</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">有效期</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-semibold">价格</th>
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
          <p>&copy; 2024 GlobalPass. All rights reserved.</p>
          <p className="mt-2 opacity-50">
            Impact verification: ee6eb054-80e6-4184-9cb0-f2336e37b8ad
          </p>
        </footer>
      </div>
    </div>
  );
}
