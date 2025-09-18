/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignore ESLint during production builds to prevent type lint errors from failing build
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'wagmi',
      'viem',
      'connectkit'
    ],
  },
};

export default nextConfig;
