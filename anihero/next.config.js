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
              value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk-telemetry.com; connect-src 'self' https://clerk-telemetry.com https://api.jikan.moe; img-src 'self' https://cdn.myanimelist.net data:;"
            },
          ],
        },
      ]
    },
  };
  
  module.exports = nextConfig;