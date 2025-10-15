import { NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProduct } from '@/lib/products';
import type { Category } from '@/app/generated/prisma';
import { errorHandler } from '@/lib/errorHandler';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = await getProductById(productId);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return errorHandler(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await params;
    const body = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const {
      name,
      priceInGrosz,
      priceInCents,
      description,
      imagePaths,
      imagePublicIds,
      isAvailable,
      category,
    } = body as {
      name?: string;
      priceInGrosz?: number | string;
      priceInCents?: number | string;
      description?: string;
      imagePaths?: string[];
      imagePublicIds?: string[];
      isAvailable?: boolean;
      category?: Category;
    };

    const priceG = priceInGrosz !== undefined ? Number(priceInGrosz) : undefined;
    const priceC = priceInCents !== undefined ? Number(priceInCents) : undefined;

    const sanitizedCategory = category ? (String(category).toUpperCase() as Category) : undefined;

    const product = await updateProduct(productId, {
      ...(name && { name }),
      ...(priceG !== undefined && Number.isFinite(priceG) && { priceInGrosz: priceG }),
      ...(priceC !== undefined && Number.isFinite(priceC) && { priceInCents: priceC }),
      ...(description && { description }),
      ...(imagePaths && { imagePaths }),
      ...(imagePublicIds && { imagePublicIds }),
      ...(isAvailable !== undefined && { isAvailable }),
      ...(sanitizedCategory && { category: sanitizedCategory }),
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return errorHandler(error);
  }
}
