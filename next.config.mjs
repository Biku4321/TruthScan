/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false, // Tell webpack to ignore 'fs' on the client
      zlib: false,
    };
    return config;
  },
};

export default nextConfig;