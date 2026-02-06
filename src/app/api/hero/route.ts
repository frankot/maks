import { NextRequest, NextResponse } from 'next/server';
import { getHeroContent, createHeroContent, updateHeroContent } from '@/lib/hero';

export async function GET() {
  try {
    const heroContent = await getHeroContent();
    return NextResponse.json(heroContent);
  } catch (error) {
    console.error('Error fetching hero content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, imagePaths, imagePublicIds } = body;

    if (!imagePaths || !Array.isArray(imagePaths)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const heroContent = await createHeroContent({
      description: description || '',
      imagePaths,
      imagePublicIds: imagePublicIds || [],
    });

    return NextResponse.json(heroContent, { status: 201 });
  } catch (error) {
    console.error('Error creating hero content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, description, imagePaths, imagePublicIds } = body;

    if (!id) {
      return NextResponse.json({ error: 'Hero content ID is required' }, { status: 400 });
    }

    const heroContent = await updateHeroContent(id, {
      ...(description && { description }),
      ...(imagePaths && { imagePaths }),
      ...(imagePublicIds && { imagePublicIds }),
    });

    return NextResponse.json(heroContent);
  } catch (error) {
    console.error('Error updating hero content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
