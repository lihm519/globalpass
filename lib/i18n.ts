import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 翻译资源
const resources = {
  en: {
    translation: {
      // 导航
      home: 'Home',
      esimComparison: 'E-SIM Comparison',
      compatibility: 'Phone Compatibility',
      
      // 首页
      title: 'GlobalPass',
      subtitle: 'Global E-SIM Price Comparison & Phone Compatibility Check',
      realtimeComparison: 'Real-time Comparison',
      realtimeComparisonDesc: 'Compare E-SIM packages from 20+ countries',
      compatibilityCheck: 'Compatibility Check',
      compatibilityCheckDesc: 'Check if your phone supports E-SIM',
      aiAssistant: 'AI Shopping Assistant',
      aiAssistantDesc: 'Smart recommendations for the best package',
      popularPackages: 'Popular Packages',
      loading: 'Loading...',
      country: 'Country',
      provider: 'Provider',
      data: 'Data',
      validity: 'Validity',
      price: 'Price',
      
      // E-SIM 页面
      selectCountry: 'Select Country',
      allCountries: 'All Countries',
      filterByData: 'Filter by Data',
      filterByValidity: 'Filter by Validity',
      sortBy: 'Sort By',
      sortByPrice: 'Price: Low to High',
      sortByData: 'Data: High to Low',
      buyNow: 'Buy Now',
      
      // AI 导购
      aiChatTitle: 'AI Shopping Assistant',
      aiChatPlaceholder: 'Ask me anything about E-SIM packages...',
      send: 'Send',
      
      // 兼容性检测
      checkCompatibility: 'Check Compatibility',
      selectBrand: 'Select Brand',
      selectModel: 'Select Model',
      check: 'Check',
      compatible: 'Compatible',
      notCompatible: 'Not Compatible',
      
      // 通用
      copyright: '© 2024 GlobalPass. All rights reserved.',
      
      // AI
      aiWelcome: 'Hi! I can help you find the best E-SIM package. Tell me about your travel plans!',
      
      // 兼容性
      compatibleMessage: 'Great! Your phone supports E-SIM. You can start shopping for packages!',
      notCompatibleMessage: 'Unfortunately, this model does not support E-SIM. Please check with your carrier or consider upgrading.',
      browsePackages: 'Browse E-SIM Packages',
      aboutESIM: 'About E-SIM',
      esimDescription: 'E-SIM (embedded SIM) is a digital SIM that allows you to activate a cellular plan without using a physical SIM card.',
      esimBenefits: 'Benefits: No physical SIM card needed, easy to switch carriers, perfect for international travel, and supports multiple numbers on one device.',
      esimRequirements: 'Requirements: Your device must support E-SIM technology, and your carrier must offer E-SIM activation.',
    },
  },
  'zh-CN': {
    translation: {
      home: '首页',
      esimComparison: 'E-SIM 比价',
      compatibility: '手机兼容性',
      
      title: 'GlobalPass',
      subtitle: '全球 E-SIM 比价与手机兼容性检测',
      realtimeComparison: '实时比价',
      realtimeComparisonDesc: '对比 20+ 国家的 E-SIM 套餐价格',
      compatibilityCheck: '兼容性检测',
      compatibilityCheckDesc: '一键检测您的手机是否支持 E-SIM',
      aiAssistant: 'AI 导购助手',
      aiAssistantDesc: '智能推荐最适合您的套餐',
      popularPackages: '热门套餐',
      loading: '加载中...',
      country: '国家',
      provider: '提供商',
      data: '流量',
      validity: '有效期',
      price: '价格',
      
      selectCountry: '选择国家',
      allCountries: '所有国家',
      filterByData: '按流量筛选',
      filterByValidity: '按有效期筛选',
      sortBy: '排序方式',
      sortByPrice: '价格：从低到高',
      sortByData: '流量：从高到低',
      buyNow: '立即购买',
      
      aiChatTitle: 'AI 导购助手',
      aiChatPlaceholder: '问我任何关于 E-SIM 套餐的问题...',
      send: '发送',
      
      checkCompatibility: '检测兼容性',
      selectBrand: '选择品牌',
      selectModel: '选择型号',
      check: '检测',
      compatible: '兼容',
      notCompatible: '不兼容',
      
      copyright: '© 2024 GlobalPass. 保留所有权利。',
      
      aiWelcome: '你好！我可以帮你找到最合适的 E-SIM 套餐。告诉我你的旅行计划吧！',
      
      compatibleMessage: '太好了！您的手机支持 E-SIM。您可以开始选购套餐了！',
      notCompatibleMessage: '很遗憾，此型号不支持 E-SIM。请咨询运营商或考虑升级设备。',
      browsePackages: '浏览 E-SIM 套餐',
      aboutESIM: '关于 E-SIM',
      esimDescription: 'E-SIM（嵌入式 SIM 卡）是一种数字 SIM 卡，无需使用实体 SIM 卡即可激活移动套餐。',
      esimBenefits: '优势：无需实体 SIM 卡、轻松切换运营商、非常适合国际旅行、一台设备支持多个号码。',
      esimRequirements: '要求：您的设备必须支持 E-SIM 技术，且运营商必须提供 E-SIM 激活服务。',
    },
  },
  ja: {
    translation: {
      home: 'ホーム',
      esimComparison: 'E-SIM比較',
      compatibility: '互換性チェック',
      
      title: 'GlobalPass',
      subtitle: 'グローバル E-SIM 価格比較と互換性チェック',
      realtimeComparison: 'リアルタイム比較',
      realtimeComparisonDesc: '20以上の国のE-SIMパッケージを比較',
      compatibilityCheck: '互換性チェック',
      compatibilityCheckDesc: 'お使いの携帯電話がE-SIMに対応しているか確認',
      aiAssistant: 'AIアシスタント',
      aiAssistantDesc: '最適なパッケージをスマート推薦',
      popularPackages: '人気パッケージ',
      loading: '読み込み中...',
      country: '国',
      provider: 'プロバイダー',
      data: 'データ',
      validity: '有効期限',
      price: '価格',
      
      selectCountry: '国を選択',
      allCountries: 'すべての国',
      filterByData: 'データで絞り込み',
      filterByValidity: '有効期限で絞り込み',
      sortBy: '並べ替え',
      sortByPrice: '価格：安い順',
      sortByData: 'データ：多い順',
      buyNow: '今すぐ購入',
      
      aiChatTitle: 'AIアシスタント',
      aiChatPlaceholder: 'E-SIMパッケージについて何でも聞いてください...',
      send: '送信',
      
      checkCompatibility: '互換性をチェック',
      selectBrand: 'ブランドを選択',
      selectModel: 'モデルを選択',
      check: 'チェック',
      compatible: '対応',
      notCompatible: '非対応',
      
      copyright: '© 2024 GlobalPass. All rights reserved.',
      
      aiWelcome: 'こんにちは！最適なE-SIMパッケージを見つけるお手伝いをします。旅行の計画を教えてください！',
      
      compatibleMessage: '素晴らしい！お使いの携帯電話はE-SIMに対応しています。パッケージの購入を開始できます！',
      notCompatibleMessage: '残念ながら、このモデルはE-SIMに対応していません。通信事業者にお問い合わせいただくか、アップグレードをご検討ください。',
      browsePackages: 'E-SIMパッケージを閲覧',
      aboutESIM: 'E-SIMについて',
      esimDescription: 'E-SIM（組み込みSIM）は、物理的なSIMカードを使用せずに携帯電話プランをアクティベートできるデジタルSIMです。',
      esimBenefits: 'メリット：物理的なSIMカード不要、通信事業者の切り替えが簡単、国際旅行に最適、1台のデバイスで複数の番号をサポート。',
      esimRequirements: '要件：デバイスがE-SIM技術に対応している必要があり、通信事業者がE-SIMアクティベーションを提供している必要があります。',
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
