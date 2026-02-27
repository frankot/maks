import { z } from 'zod'

export const createProductSchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  priceInGrosz: z.coerce.number().int().positive(),
  priceInCents: z.coerce.number().int().positive(),
  description: z.string().min(1, 'Description is required'),
  materials: z.string().nullable().optional(),
  imagePaths: z.array(z.string()).optional(),
  imagePublicIds: z.array(z.string()).optional(),
  productStatus: z.enum(['SHOP', 'ORDERED', 'SOLD']).optional(),
  isAvailable: z.boolean().optional(),
  category: z.enum(['NECKLACES', 'RINGS', 'EARRINGS', 'BRACELETS', 'CHAINS']).optional(),
  collectionId: z.string().nullable().optional(),
})

export const updateProductSchema = createProductSchema.partial()

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
