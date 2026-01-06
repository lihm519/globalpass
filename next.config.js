/** @type {import('next').NextConfig} */
const nextConfig = {
  // 明确禁用静态导出
  output: undefined,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;
