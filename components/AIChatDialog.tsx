'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface ESIMPackage {
  id: number;
  provider: string;
  country: string;
  plan_name: string;
  data_amount: string;
  validity: string;
  price: number;
  link: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  packages?: ESIMPackage[]; // AI 推荐的套餐
}

interface AIChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatDialog({ isOpen, onClose }: AIChatDialogProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: t('aiWelcome', 'Hi! I can help you find the best E-SIM package. Tell me about your travel plans!'),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // 1. 加载套餐数据
      const packagesResponse = await fetch('/data/esim-packages.json');
      const packagesData = await packagesResponse.json();
      const allPackages = (Object.values(packagesData.packages).flat() as ESIMPackage[]);
      
      console.log('Loaded packages:', allPackages.length);

      // 2. 根据用户问题筛选相关套餐（简单关键词匹配）
      const userInput = input.toLowerCase();
      let relevantPackages = allPackages;
      
      // 提取国家关键词
      const countryKeywords: Record<string, string[]> = {
        'japan': ['japan', '日本'],
        'usa': ['usa', 'america', '美国'],
        'thailand': ['thailand', '泰国'],
        'korea': ['korea', '韩国'],
        'singapore': ['singapore', '新加坡'],
        'china': ['china', '中国'],
        'hong kong': ['hong kong', 'hongkong', '香港'],
        'taiwan': ['taiwan', '台湾'],
      };
      
      let targetCountry = '';
      for (const [country, keywords] of Object.entries(countryKeywords)) {
        if (keywords.some(kw => userInput.includes(kw))) {
          targetCountry = country;
          break;
        }
      }
      
      // 如果找到国家，筛选该国家的套餐
      if (targetCountry) {
        relevantPackages = allPackages.filter(pkg => 
          pkg.country.toLowerCase().includes(targetCountry)
        );
        console.log(`Filtered packages for ${targetCountry}:`, relevantPackages.length);
      }
      
      // 按价格排序，取前 3 个最便宜的
      const topPackages = relevantPackages
        .sort((a, b) => a.price - b.price)
        .slice(0, 3);

      // 3. 调用后端 API Route（避免 CORS 问题）
      const aiResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          packages: topPackages,
        }),
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json();
        throw new Error(errorData.error || 'AI API call failed');
      }

      const { response: text } = await aiResponse.json();
      console.log('AI Response:', text);

      // 4. 添加回复和推荐套餐
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: text,
        packages: topPackages.length > 0 ? topPackages : undefined
      }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`,
        packages: undefined
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🤖</div>
            <h2 className="text-2xl font-bold">{t('aiChatTitle')}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <div key={index}>
              {/* 文字消息 */}
              <div
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
              
              {/* AI 推荐的套餐卡片 */}
              {msg.role === 'assistant' && msg.packages && msg.packages.length > 0 && (
                <div className="mt-4 space-y-3">
                  {msg.packages.map((pkg) => (
                    <a
                      key={pkg.id}
                      href={pkg.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-slate-800 border border-white/10 rounded-xl p-4 hover:border-emerald-500/30 hover:scale-[1.02] transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              pkg.provider === 'Airalo' 
                                ? 'bg-blue-500/20 text-blue-400' 
                                : 'bg-orange-500/20 text-orange-400'
                            }`}>
                              {pkg.provider}
                            </span>
                            <span className="text-slate-400 text-sm">{pkg.country}</span>
                          </div>
                          <h3 className="text-white font-semibold mb-1">{pkg.plan_name}</h3>
                          <div className="flex items-center gap-3 text-sm text-slate-300">
                            <span>📶 {pkg.data_amount}</span>
                            <span>⏱️ {pkg.validity}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-emerald-400">${pkg.price}</div>
                          <div className="text-xs text-slate-400 mt-1">点击购买 →</div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 px-4 py-3 rounded-2xl">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-white/10">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('aiChatPlaceholder')}
              className="flex-1 px-4 py-3 bg-slate-800 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-slate-400"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
            >
              {t('send')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
