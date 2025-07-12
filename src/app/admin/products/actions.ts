"use server";

import { revalidatePath } from "next/cache";
import { deleteProduct } from "@/lib/products";

export async function deleteProductAction(productId: string) {
  try {
    await deleteProduct(productId);
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Failed to delete product" };
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
