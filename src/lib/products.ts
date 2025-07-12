import { prisma } from "./prisma";
import type { Product } from "@/app/generated/prisma";

export function formatPrice(priceInGrosz: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(priceInGrosz / 100);
}

export function formatPriceEur(priceInCents: number): string {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(priceInCents / 100);
}

export function getAvailabilityBadgeVariant(isAvailable: boolean) {
  return isAvailable ? "default" : "destructive";
}

export function getAvailabilityLabel(isAvailable: boolean) {
  return isAvailable ? "Available" : "Unavailable";
}

export async function getProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });
    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function createProduct(data: {
  name: string;
  priceInGrosz: number;
  priceInCents: number;
  description: string;
  imagePaths?: string[];
  imagePublicIds?: string[];
  isAvailable?: boolean;
}): Promise<Product> {
  const product = await prisma.product.create({
    data: {
      name: data.name,
      priceInGrosz: data.priceInGrosz,
      priceInCents: data.priceInCents,
      description: data.description,
      imagePaths: data.imagePaths || [],
      imagePublicIds: data.imagePublicIds || [],
      isAvailable: data.isAvailable ?? true,
    },
  });
  return product;
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    priceInGrosz?: number;
    priceInCents?: number;
    description?: string;
    imagePaths?: string[];
    imagePublicIds?: string[];
    isAvailable?: boolean;
  },
): Promise<Product> {
  const product = await prisma.product.update({
    where: { id },
    data,
  });
  return product;
}

export async function deleteProduct(id: string): Promise<void> {
  await prisma.product.delete({
    where: { id },
  });
}
