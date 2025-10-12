import { prisma } from "./prisma";
import type { Product, OrderItem, ProductStatus, Category } from "@/app/generated/prisma";

// Extended Product type with orderItems
export type ProductWithOrderItems = Product & {
  orderItems: OrderItem[];
};

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

export async function getProducts(): Promise<ProductWithOrderItems[]> {
  try {
    const products = await prisma.product.findMany({
      include: {
        orderItems: true,
      },
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

function generateProductId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

async function getUniqueProductId(name: string): Promise<string> {
  const baseId = generateProductId(name);
  let uniqueId = baseId;
  let counter = 1;

  while (true) {
    const existingProduct = await prisma.product.findUnique({
      where: { id: uniqueId },
    });

    if (!existingProduct) {
      return uniqueId;
    }

    uniqueId = `${baseId}-${counter}`;
    counter++;
  }
}

export async function createProduct(data: {
  id?: string;
  name: string;
  priceInGrosz: number;
  priceInCents: number;
  description: string;
  imagePaths?: string[];
  imagePublicIds?: string[];
  productStatus?: ProductStatus;
  isAvailable?: boolean;
  category?: Category;
}): Promise<Product> {
  // Use provided ID or generate one from name
  const id = data.id || (await getUniqueProductId(data.name));

  // Check if custom ID already exists
  if (data.id) {
    const existingProduct = await prisma.product.findUnique({
      where: { id: data.id },
    });

    if (existingProduct) {
      throw new Error(`Product with ID "${data.id}" already exists`);
    }
  }

  const product = await prisma.product.create({
    data: {
      id,
      name: data.name,
      priceInGrosz: data.priceInGrosz,
      priceInCents: data.priceInCents,
      description: data.description,
      imagePaths: data.imagePaths || [],
      imagePublicIds: data.imagePublicIds || [],
      productStatus: data.productStatus || "SHOP",
      isAvailable: data.isAvailable ?? true,
      category: data.category ?? undefined,
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
    productStatus?: ProductStatus;
    isAvailable?: boolean;
    category?: Category;
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

export async function getFeaturedProducts(category?: Category): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        isAvailable: true,
        productStatus: "SHOP",
        ...(category ? { category } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
    });
    return products;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

export async function getProductsByCategory(category: Category, take = 24): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        category,
        isAvailable: true,
        productStatus: "SHOP",
      },
      orderBy: { createdAt: "desc" },
      take,
    });
    return products;
  } catch (error) {
    console.error(`Error fetching products for category ${category}:`, error);
    return [];
  }
}
