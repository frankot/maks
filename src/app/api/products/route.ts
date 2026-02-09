import { NextRequest, NextResponse } from 'next/server';
import { createProduct } from '@/lib/products';
import type { Category } from '@prisma/client';
import { errorHandler } from '@/lib/errorHandler';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');

    if (featured === 'true') {
      const { getFeaturedProducts } = await import('@/lib/products');
      const products = await getFeaturedProducts();
      return NextResponse.json(products);
    } else {
      // Use getShopProducts for customer-facing API to exclude ORDERED products
      const { getShopProducts } = await import('@/lib/products');
      const products = await getShopProducts();
      return NextResponse.json(products);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    return errorHandler(error);
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();

    const {
      id,
      slug,
      name,
      priceInGrosz,
      priceInCents,
      description,
      materials,
      imagePaths,
      imagePublicIds,
      isAvailable,
      category,
      collectionId,
    } = body as {
      id?: string;
      slug?: string;
      name: string;
      priceInGrosz: number | string;
      priceInCents: number | string;
      description: string;
      materials?: string | null;
      imagePaths?: string[];
      imagePublicIds?: string[];
      isAvailable?: boolean;
      category?: Category;
      collectionId?: string | null;
    };

    const priceG = Number(priceInGrosz);
    const priceC = Number(priceInCents);
    if (!name || !Number.isFinite(priceG) || !Number.isFinite(priceC) || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // sanitize category if provided (ensure uppercase enum value)
    const sanitizedCategory = category ? (String(category).toUpperCase() as Category) : undefined;

    const product = await createProduct({
      id,
      slug,
      name,
      priceInGrosz: priceG,
      priceInCents: priceC,
      description,
      materials: materials || null,
      imagePaths: imagePaths || [],
      imagePublicIds: imagePublicIds || [],
      isAvailable: isAvailable ?? true,
      category: sanitizedCategory,
      collectionId: collectionId || null,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return errorHandler(error);
  }
}
