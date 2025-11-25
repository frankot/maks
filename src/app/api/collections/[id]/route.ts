import { NextResponse } from 'next/server';
import { deleteCollection } from '@/lib/collections';
import { errorHandler } from '@/lib/errorHandler';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 });
    }

    await deleteCollection(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return errorHandler(error);
  }
}
