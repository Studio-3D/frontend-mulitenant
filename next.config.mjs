/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for better performance on Vercel
  output: 'standalone',
  
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Enable SWC minification for faster builds
  swcMinify: true,
  
  // Configure image domains if you're using next/image with external images
  images: {
    domains: ['example.com'],
    // Enable remote patterns if needed
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Add any other necessary configurations here
};

export default nextConfig;