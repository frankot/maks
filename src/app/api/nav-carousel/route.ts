import { NextRequest, NextResponse } from 'next/server';
import {
  getNavCarouselContent,
  createNavCarouselContent,
  updateNavCarouselContent,
} from '@/lib/nav-carousel';

export async function GET() {
  try {
    const content = await getNavCarouselContent();
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching nav carousel content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { texts } = body;

    if (!texts || !Array.isArray(texts)) {
      return NextResponse.json({ error: 'Texts array is required' }, { status: 400 });
    }

    const content = await createNavCarouselContent({ texts });
    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error('Error creating nav carousel content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, texts } = body;

    if (!id) {
      return NextResponse.json({ error: 'Nav carousel content ID is required' }, { status: 400 });
    }

    if (!texts || !Array.isArray(texts)) {
      return NextResponse.json({ error: 'Texts array is required' }, { status: 400 });
    }

    const content = await updateNavCarouselContent(id, { texts });
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error updating nav carousel content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
