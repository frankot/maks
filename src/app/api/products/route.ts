import { NextRequest, NextResponse } from 'next/server';
import { createProduct, getProducts } from '@/lib/products';
import type { Category } from '@/app/generated/prisma';
import { errorHandler } from '@/lib/errorHandler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');

    if (featured === 'true') {
      const { getFeaturedProducts } = await import('@/lib/products');
      const products = await getFeaturedProducts();
      return NextResponse.json(products);
    } else {
      const products = await getProducts();
      return NextResponse.json(products);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    return errorHandler(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      id,
      name,
      priceInGrosz,
      priceInCents,
      description,
      imagePaths,
      imagePublicIds,
      isAvailable,
      category,
    } = body as {
      id?: string;
      name: string;
      priceInGrosz: number | string;
      priceInCents: number | string;
      description: string;
      imagePaths?: string[];
      imagePublicIds?: string[];
      isAvailable?: boolean;
      category?: Category;
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
      name,
      priceInGrosz: priceG,
      priceInCents: priceC,
      description,
      imagePaths: imagePaths || [],
      imagePublicIds: imagePublicIds || [],
      isAvailable: isAvailable ?? true,
      category: sanitizedCategory,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return errorHandler(error);
  }
}
