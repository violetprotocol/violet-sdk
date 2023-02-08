/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  transpilePackages: ["sdk"],
};

module.exports = nextConfig;
