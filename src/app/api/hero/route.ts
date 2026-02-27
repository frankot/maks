import { NextRequest, NextResponse } from 'next/server'
import { getHeroContent, createHeroContent, updateHeroContent } from '@/lib/hero'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createHeroSchema, updateHeroSchema } from '@/lib/validators/hero'

// Enable ISR with 1 hour revalidation
export const revalidate = 3600

export async function GET() {
  try {
    const heroContent = await getHeroContent()
    return NextResponse.json(heroContent)
  } catch (error) {
    console.error('Error fetching hero content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const parsed = createHeroSchema.parse(body)

    const heroContent = await createHeroContent({
      description: parsed.description,
      imagePaths: parsed.imagePaths,
      imagePublicIds: parsed.imagePublicIds,
    })

    return NextResponse.json(heroContent, { status: 201 })
  } catch (error) {
    console.error('Error creating hero content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const parsed = updateHeroSchema.parse(body)

    const heroContent = await updateHeroContent(parsed.id, {
      ...(parsed.description && { description: parsed.description }),
      ...(parsed.imagePaths && { imagePaths: parsed.imagePaths }),
      ...(parsed.imagePublicIds && { imagePublicIds: parsed.imagePublicIds }),
    })

    return NextResponse.json(heroContent)
  } catch (error) {
    console.error('Error updating hero content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
