import type { ImageLoaderProps } from 'next/image'

/**
 * Custom image loader for Next.js that handles both:
 * 1. Cloudinary URLs - applies f_auto, q_auto, w_auto, dpr_auto transformations
 * 2. Local paths - passes through to default Next.js optimization
 *
 * This keeps us within Cloudinary's free tier limits by using URL-based
 * transformations instead of API-based ones.
 */
export default function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  // Handle local paths - serve directly from /public
  // Note: Local images bypass Next.js optimization when using custom loader
  // Consider uploading them to Cloudinary for optimization
  if (src.startsWith('/')) {
    return src
  }

  // Handle Cloudinary URLs
  if (src.includes('res.cloudinary.com')) {
    // Parse the Cloudinary URL to extract parts
    // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{version}/{path}
    const urlParts = src.split('/upload/')
    if (urlParts.length !== 2) {
      // Malformed URL, return as-is
      return src
    }

    const [baseUrl, assetPath] = urlParts

    // Build transformation string
    // f_auto: automatic format selection (WebP/AVIF based on browser support)
    // q_auto: automatic quality optimization
    // w_XXX: resize to specific width
    // dpr_auto: automatic device pixel ratio handling
    const transformations = [
      'f_auto', // Format: auto (WebP/AVIF)
      `q_${quality || 'auto'}`, // Quality: auto or specific value
      `w_${width}`, // Width: requested size
      'dpr_auto', // DPR: automatic (handles retina displays)
    ].join(',')

    // Reconstruct URL with transformations
    return `${baseUrl}/upload/${transformations}/${assetPath}`
  }

  // For any other URLs, return as-is
  return src
}
