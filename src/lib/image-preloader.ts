/**
 * Preload a single image by creating an Image object
 * Returns a promise that resolves when the image is loaded
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Preload multiple images in parallel
 * Returns a promise that resolves when all images are loaded
 */
export async function preloadImages(srcs: string[]): Promise<void> {
  try {
    await Promise.all(srcs.map((src) => preloadImage(src)));
  } catch (error) {
    console.error('Error preloading images:', error);
    // Don't throw - we want to show the page even if some images fail
  }
}

/**
 * Fetch hero content from API and return all image paths
 */
export async function fetchHeroImages(): Promise<string[]> {
  try {
    const response = await fetch('/api/hero');
    if (!response.ok) {
      console.error('Failed to fetch hero content:', response.status);
      return [];
    }
    const data = await response.json();
    return data?.imagePaths || [];
  } catch (error) {
    console.error('Error fetching hero images:', error);
    return [];
  }
}

/**
 * List of critical local images used across subpages
 */
export const CRITICAL_LOCAL_IMAGES = [
  '/about_bg.jpg', // About & Contact pages
  '/shop_main.jpg', // Shop pages
  '/gall_bg.jpg', // Gallery page
];

/**
 * Preload all critical images (hero + subpages)
 * This ensures a smooth experience when navigating the site
 */
export async function preloadAllCriticalImages(): Promise<void> {
  try {
    // Fetch hero images from CMS
    const heroImages = await fetchHeroImages();

    // Combine hero images with local critical images
    const allImages = [...heroImages, ...CRITICAL_LOCAL_IMAGES];

    // Remove duplicates
    const uniqueImages = Array.from(new Set(allImages));

    // Preload all images in parallel
    await preloadImages(uniqueImages);
  } catch (error) {
    console.error('Error in preloadAllCriticalImages:', error);
    // Don't throw - show the page anyway
  }
}
