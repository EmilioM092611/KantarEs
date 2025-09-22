/** @type {import('next').NextConfig} */
const nextConfig = {
  // Solo usar export en build para Electron, no en desarrollo
  ...(process.env.NEXT_EXPORT === 'true' && {
    output: 'export',
    distDir: 'out',
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
  }),

  // Configuración para desarrollo con Electron
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',

  // Configuraciones adicionales para compatibilidad
  experimental: {
    esmExternals: false,
  },

  webpack: (config, { isServer }) => {
    // Configuración específica para Electron
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // Variables de entorno
  env: {
    NEXT_PUBLIC_IS_ELECTRON: process.env.NODE_ENV === 'development' ? 'false' : 'true',
  },
};

export default nextConfig;