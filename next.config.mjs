/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  reactStrictMode: true,
  // swcMinify: true,

  images: {
    domains: ["example.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
