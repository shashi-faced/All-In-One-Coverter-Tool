/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'convertforge.s3.amazonaws.com'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

};

module.exports = nextConfig;
