import type { AppProps } from 'next/app';
import './globals.css';
import '@/lib/i18n'; // Initialize i18n for all pages

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
