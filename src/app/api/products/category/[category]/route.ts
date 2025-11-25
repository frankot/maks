import { NextRequest, NextResponse } from 'next/server';
import { getProductsByCategory } from '@/lib/products';
import type { Category } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params;

    // Validate category
    const validCategories: Category[] = ['RINGS', 'NECKLACES', 'EARRINGS'];
    const upperCategory = category.toUpperCase() as Category;

    if (!validCategories.includes(upperCategory)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be one of: RINGS, NECKLACES, EARRINGS' },
        { status: 400 }
      );
    }

    const products = await getProductsByCategory(upperCategory);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error in products/category API:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
