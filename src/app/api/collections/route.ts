import { NextRequest, NextResponse } from 'next/server';
import { getCollections, createCollection } from '@/lib/collections';
import { errorHandler } from '@/lib/errorHandler';

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
  try {
    const body = await request.json();
    const { name, slug } = body as { name: string; slug?: string };

    if (!name) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    const collection = await createCollection({ name, slug });
    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error('Error creating collection:', error);
    return errorHandler(error);
  }
}
