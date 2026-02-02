import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";


const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GlobalPass - Compare eSIM Prices for International Travel | Best Data Plans",
  description: "Find the cheapest eSIM packages for your trip. Compare real-time prices from Airalo, Nomad, and more. 425+ packages across 20+ countries. Save up to 50% on international data.",
  keywords: [
    "eSIM",
    "international data",
    "travel SIM card",
    "mobile data roaming",
    "Airalo alternative",
    "cheap eSIM",
    "travel data plan",
    "global eSIM",
    "prepaid data",
    "international roaming"
  ],
  authors: [{ name: "GlobalPass Team" }],
  creator: "GlobalPass",
  publisher: "GlobalPass",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://globalpass.vercel.app',
    siteName: 'GlobalPass',
    title: 'GlobalPass - Compare eSIM Prices for International Travel',
    description: 'Find the cheapest eSIM packages for your trip. Compare real-time prices from Airalo, Nomad, and more. Save up to 50% on international data.',
    images: [
      {
        url: 'https://globalpass.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GlobalPass - eSIM Price Comparison',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GlobalPass - Compare eSIM Prices for International Travel',
    description: 'Find the cheapest eSIM packages for your trip. Compare real-time prices from multiple providers.',
    images: ['https://globalpass.vercel.app/og-image.png'],
    creator: '@globalpass',
  },
  alternates: {
    canonical: 'https://globalpass.vercel.app',
  },
  other: {
    'impact-site-verification': '1fc16c95-0e9b-47aa-a07b-cb3c5a80a6b8',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* JSON-LD 结构化数据 - 帮助 AI 理解网站 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "GlobalPass",
              "description": "Compare eSIM prices for international travel. Find the best data plans from Airalo, Nomad, and more.",
              "url": "https://globalpass.vercel.app",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://globalpass.vercel.app/esim?country={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "GlobalPass",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://globalpass.vercel.app/logo.png"
                }
              }
            })
          }}
        />
        
        {/* 产品聚合数据 - 告诉 AI 我们提供什么 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "eSIM Data Plans",
              "description": "International eSIM data plans for travelers. Compare prices from multiple providers.",
              "brand": {
                "@type": "Brand",
                "name": "GlobalPass"
              },
              "offers": {
                "@type": "AggregateOffer",
                "priceCurrency": "USD",
                "lowPrice": "4.50",
                "highPrice": "99.00",
                "offerCount": "425"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "1250"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
