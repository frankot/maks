import { z } from 'zod'

export const upsertFeaturedSectionSchema = z.object({
  title: z.string().min(1),
  href: z.string().min(1),
  productIds: z.array(z.string()).max(12),
})

export type UpsertFeaturedSectionInput = z.infer<typeof upsertFeaturedSectionSchema>
