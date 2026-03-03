import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma'],
  images: {
    loader: 'custom',
    loaderFile: './src/lib/cloudinary-loader.ts',
    qualities: [25, 50, 75, 85, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
