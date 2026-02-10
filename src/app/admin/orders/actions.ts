'use server';

import { z } from 'zod';
import { actionClient } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';
import { updateOrderStatus, deleteOrder, getOrderById } from '@/lib/orders';
import { sendOrderCancellationEmail } from '@/lib/email';
import { OrderStatus } from '@prisma/client';

const orderIdSchema = z.object({ orderId: z.string().uuid() });

export const markAsShippedAction = actionClient
  .inputSchema(orderIdSchema)
  .action(async ({ parsedInput: { orderId } }) => {
    await updateOrderStatus(orderId, OrderStatus.SHIPPED);
    revalidatePath('/admin/orders');
    return { success: true };
  });

export const cancelOrderAction = actionClient
  .inputSchema(orderIdSchema)
  .action(async ({ parsedInput: { orderId } }) => {
    await updateOrderStatus(orderId, OrderStatus.CANCELLED);
    const order = await getOrderById(orderId);
    if (order?.user) {
      const name = `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim();
      await sendOrderCancellationEmail(order.user.email, name, orderId);
    }
    revalidatePath('/admin/orders');
    return { success: true };
  });

export const deleteOrderAction = actionClient
  .inputSchema(orderIdSchema)
  .action(async ({ parsedInput: { orderId } }) => {
    await deleteOrder(orderId);
    revalidatePath('/admin/orders');
    return { success: true };
  });
