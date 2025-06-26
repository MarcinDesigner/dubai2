/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['example.com'], // Add your image domains here
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    return config;
  },
}

module.exports = nextConfig 