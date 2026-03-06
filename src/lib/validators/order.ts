import { z } from 'zod'

export const checkoutSchema = z.object({
  email: z.string().email(),
  phoneNumber: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  deliveryMethod: z.enum(['paczkomat', 'address']),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        priceInCents: z.number().int().positive(),
        name: z.string(),
        imagePath: z.string().optional(),
      })
    )
    .min(1, 'Cart cannot be empty'),
  street: z.string().optional(),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  paczkomatPointId: z.string().optional(),
  discountCode: z.string().optional(),
  currency: z.enum(['PLN', 'EUR']).default('PLN'),
})

export const orderIdSchema = z.object({
  orderId: z.string().uuid(),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
