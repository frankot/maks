import { z } from 'zod';

export const createHeroSchema = z.object({
  description: z.string().optional().default(''),
  imagePaths: z.array(z.string()).min(1, 'At least one image is required'),
  imagePublicIds: z.array(z.string()).optional().default([]),
});

export const updateHeroSchema = z.object({
  id: z.string().uuid(),
  description: z.string().optional(),
  imagePaths: z.array(z.string()).optional(),
  imagePublicIds: z.array(z.string()).optional(),
});

export type CreateHeroInput = z.infer<typeof createHeroSchema>;
export type UpdateHeroInput = z.infer<typeof updateHeroSchema>;
