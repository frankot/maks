'use server';

import { revalidatePath } from 'next/cache';
import { updateOrderStatus, deleteOrder } from '@/lib/orders';
import { OrderStatus } from '@prisma/client';

export async function markAsShippedAction(orderId: string) {
  try {
    await updateOrderStatus(orderId, OrderStatus.SHIPPED);
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error) {
    console.error('Error marking order as shipped:', error);
    return { success: false, error: 'Failed to mark order as shipped' };
  }
}

export async function deleteOrderAction(orderId: string) {
  try {
    await deleteOrder(orderId);
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error) {
    console.error('Error deleting order:', error);
    return { success: false, error: 'Failed to delete order' };
  }
}
