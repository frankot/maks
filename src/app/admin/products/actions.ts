'use server';

import { z } from 'zod';
import { actionClient } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const deleteProductAction = actionClient
  .inputSchema(z.object({ productId: z.string() }))
  .action(async ({ parsedInput: { productId } }) => {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { orderItems: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.orderItems.length > 0) {
      throw new Error(
        'Cannot delete product that has been ordered. Consider marking it as unavailable instead.'
      );
    }

    // Delete images from Cloudinary if they exist
    if (product.imagePublicIds && product.imagePublicIds.length > 0) {
      for (const publicId of product.imagePublicIds) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryError) {
          console.error('Cloudinary deletion error for publicId:', publicId, cloudinaryError);
        }
      }
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath('/admin/products');
    return { success: true };
  });

export const toggleProductAvailabilityAction = actionClient
  .inputSchema(z.object({ productId: z.string(), isAvailable: z.boolean() }))
  .action(async ({ parsedInput: { productId, isAvailable } }) => {
    const { updateProduct } = await import('@/lib/products');
    await updateProduct(productId, { isAvailable });
    revalidatePath('/admin/products');
    return { success: true };
  });

export const updateProductStatusAction = actionClient
  .inputSchema(
    z.object({
      productId: z.string(),
      productStatus: z.enum(['SHOP', 'ORDERED', 'SOLD']),
    })
  )
  .action(async ({ parsedInput: { productId, productStatus } }) => {
    const { updateProduct } = await import('@/lib/products');
    await updateProduct(productId, { productStatus });
    revalidatePath('/admin/products');
    return { success: true };
  });
