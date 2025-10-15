'use server';

import { revalidatePath } from 'next/cache';
import { deleteCustomer } from '@/lib/customers';

export async function deleteCustomerAction(customerId: string) {
  try {
    await deleteCustomer(customerId);
    revalidatePath('/admin/customers');
    return { success: true };
  } catch (error) {
    console.error('Error deleting customer:', error);
    return { success: false, error: 'Failed to delete customer' };
  }
}
