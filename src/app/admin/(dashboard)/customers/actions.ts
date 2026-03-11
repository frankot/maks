'use server'

import { z } from 'zod'
import { actionClient } from '@/lib/safe-action'
import { revalidatePath } from 'next/cache'
import { deleteCustomer } from '@/lib/customers'

export const deleteCustomerAction = actionClient
  .inputSchema(z.object({ customerId: z.string().uuid() }))
  .action(async ({ parsedInput: { customerId } }) => {
    await deleteCustomer(customerId)
    revalidatePath('/admin/customers')
    return { success: true }
  })
