/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['cdn.myanimelist.net'],
    },
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.anihero.vercel.app https://*.clerk.accounts.dev; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://clerk.anihero.vercel.app https://api.jikan.moe https://*.clerk.accounts.dev;",
            },
          ],
        },
      ];
    },
  };
  
  module.exports = nextConfig;