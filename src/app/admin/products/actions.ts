"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function deleteProductAction(productId: string) {
  try {
    // Get product from database first
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        orderItems: true, // Include related order items
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Check if product has been ordered
    if (product.orderItems.length > 0) {
      throw new Error(
        "Cannot delete product that has been ordered. Consider marking it as unavailable instead.",
      );
    }

    // Delete images from Cloudinary if they exist
    if (product.imagePublicIds && product.imagePublicIds.length > 0) {
      for (const publicId of product.imagePublicIds) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryError) {
          console.error(
            "Cloudinary deletion error for publicId:",
            publicId,
            cloudinaryError,
          );
          // Continue with other images even if one fails
        }
      }
    }

    // Delete from database
    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete product";
    return { success: false, error: errorMessage };
  }
}

export async function toggleProductAvailabilityAction(
  productId: string,
  isAvailable: boolean,
) {
  try {
    const { updateProduct } = await import("@/lib/products");
    await updateProduct(productId, { isAvailable });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error toggling product availability:", error);
    return { success: false, error: "Failed to update product availability" };
  }
}
