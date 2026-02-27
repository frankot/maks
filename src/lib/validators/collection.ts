import { z } from 'zod'

export const createCollectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required'),
  slug: z.string().optional(),
})

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>
