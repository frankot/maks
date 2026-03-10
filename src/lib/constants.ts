// Image upload limits
export const MAX_FILE_SIZE_MB = 10
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
export const MAX_IMAGE_DIMENSION = 2000
export const REUPLOAD_IMAGE_DIMENSION = 1600
export const IMAGE_QUALITY = 85
export const REUPLOAD_IMAGE_QUALITY = 70

// Cart
export const CART_STORAGE_KEY = 'maks-cart'

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20
export const ADMIN_PAGE_SIZE_OPTIONS = [20, 50, 100] as const
export type AdminPageSize = (typeof ADMIN_PAGE_SIZE_OPTIONS)[number]
export const FEATURED_PRODUCTS_LIMIT = 6
export const CATEGORY_PRODUCTS_LIMIT = 24

// Stripe
export const STRIPE_CURRENCY = 'pln'

// App
export const APP_NAME = 'MAKS'
