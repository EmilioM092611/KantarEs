/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Solo usar export en builds de producción, no en desarrollo
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
    trailingSlash: true,
  })
}

export default nextConfig