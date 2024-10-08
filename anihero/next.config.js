/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['cdn.myanimelist.net'],
    },
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: `
                default-src 'self';
                script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk-telemetry.com https://*.clerk.accounts.dev;
                style-src 'self' 'unsafe-inline';
                img-src 'self' https://cdn.myanimelist.net data: https://*.clerk.com;
                font-src 'self';
                frame-src 'self' https://*.clerk.accounts.dev;
                connect-src 'self' https://clerk-telemetry.com https://api.jikan.moe https://*.clerk.accounts.dev;
              `.replace(/\s+/g, ' ').trim()
            },
          ],
        },
      ]
    },
  };
  
  module.exports = nextConfig;