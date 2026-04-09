/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},

  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      zlib: false,
    };
    return config;
  },
};

export default nextConfig;
