'use server'

import { z } from 'zod'
import { actionClient } from '@/lib/safe-action'
import { revalidatePath } from 'next/cache'

export const toggleDiscountCodeAction = actionClient
  .inputSchema(z.object({ id: z.string(), isActive: z.boolean() }))
  .action(async ({ parsedInput: { id, isActive } }) => {
    const { updateDiscountCode } = await import('@/lib/discounts')
    await updateDiscountCode(id, { isActive })
    revalidatePath('/admin/discounts')
    return { success: true }
  })

export const deleteDiscountCodeAction = actionClient
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id } }) => {
    const { deleteDiscountCode } = await import('@/lib/discounts')
    await deleteDiscountCode(id)
    revalidatePath('/admin/discounts')
    return { success: true }
  })
