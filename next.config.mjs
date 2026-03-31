/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    /**
     * Loader custom: las imágenes de Cloudinary se sirven directo desde su CDN
     * con transformaciones (f_auto, q_auto, w_N), sin pasar por /_next/image.
     * Esto elimina el uso de CPU/memoria de sharp en Railway.
     */
    loader: 'custom',
    loaderFile: './src/lib/cloudinaryLoader.ts',

    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'api-web-jime-production.up.railway.app' },
    ],

    deviceSizes: [320, 480, 640, 750, 828, 1080, 1200],
    imageSizes: [64, 96, 128, 256, 384],
  },
};

export default nextConfig;
