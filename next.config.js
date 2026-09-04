/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["google-play-scraper"],
  },
};
module.exports = nextConfig;
