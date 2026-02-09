import { NextRequest, NextResponse } from 'next/server';
import { getPhotoArtists, createPhotoArtist, deletePhotoArtist } from '@/lib/gallery';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function GET() {
  try {
    const artists = await getPhotoArtists();
    return NextResponse.json(artists);
  } catch (error) {
    console.error('Error fetching photo artists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Artist name is required' }, { status: 400 });
    }

    const artist = await createPhotoArtist(name.trim());
    return NextResponse.json(artist, { status: 201 });
  } catch (error) {
    console.error('Error creating photo artist:', error);
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Artist with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
    }

    await deletePhotoArtist(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'ARTIST_HAS_IMAGES') {
      return NextResponse.json(
        { error: 'Cannot delete artist that has images. Remove their images first.' },
        { status: 409 }
      );
    }
    console.error('Error deleting photo artist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
