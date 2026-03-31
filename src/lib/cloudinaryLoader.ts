/**
 * Cloudinary image loader para Next.js.
 *
 * En lugar de proxear imágenes a través de /_next/image (que descarga la imagen
 * completa en Railway y consume CPU/memoria con sharp), generamos URLs de
 * transformación de Cloudinary directamente para que su CDN sirva la imagen
 * ya optimizada al browser.
 *
 * Transformaciones aplicadas:
 *   f_auto  → formato óptimo (WebP/AVIF según el browser)
 *   q_auto  → calidad automática según el contenido
 *   w_{n}   → redimensión al ancho requerido
 */

const UPLOAD_MARKER = '/image/upload/';

export function getCloudinaryUrl(
  src: string,
  width: number,
  quality: number | 'auto' = 'auto'
): string {
  if (!src || !src.includes('res.cloudinary.com')) return src;

  const idx = src.indexOf(UPLOAD_MARKER);
  if (idx === -1) return src;

  const before = src.slice(0, idx + UPLOAD_MARKER.length);
  const after = src.slice(idx + UPLOAD_MARKER.length);

  // No duplicar transformaciones si ya están aplicadas
  if (/^[a-z]_/.test(after)) return src;

  return `${before}f_auto,q_${quality},w_${width}/${after}`;
}

/**
 * Loader de Next.js Image.
 * Con loader: 'custom' en next.config.mjs, Next.js llama esta función
 * en lugar de proxear la imagen por /_next/image.
 */
export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (src.includes('res.cloudinary.com')) {
    return getCloudinaryUrl(src, width, quality ?? 'auto');
  }
  // URLs locales (/instagram-logo.png) u otras: devolver tal cual
  return src;
}
