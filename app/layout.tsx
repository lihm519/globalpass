import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GlobalPass - Global E-SIM Price Comparison",
  description: "Find the best international data plans with GlobalPass. Compare E-SIM prices from top providers across 20+ countries.",
  other: {
    'impact-site-verification': 'ee6eb054-80e6-4184-9cb0-f2336e37b8ad',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
