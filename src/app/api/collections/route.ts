import { NextRequest, NextResponse } from 'next/server';
import { getCollections, createCollection } from '@/lib/collections';
import { errorHandler } from '@/lib/errorHandler';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createCollectionSchema } from '@/lib/validators/collection';

export async function GET() {
  try {
    const collections = await getCollections();
    return NextResponse.json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return errorHandler(error);
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const parsed = createCollectionSchema.parse(body);

    const collection = await createCollection({ name: parsed.name, slug: parsed.slug });
    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error('Error creating collection:', error);
    return errorHandler(error);
  }
}
