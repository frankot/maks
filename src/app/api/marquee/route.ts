import { NextRequest, NextResponse } from 'next/server'
import { getMarqueeContent, createMarqueeContent, updateMarqueeContent } from '@/lib/marquee'
import { requireAdmin } from '@/lib/auth/require-admin'

export async function GET() {
  try {
    const content = await getMarqueeContent()
    return NextResponse.json(content)
  } catch (error) {
    console.error('Error fetching marquee content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const { description, href, textHref } = body

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    const content = await createMarqueeContent({ description, href, textHref })
    return NextResponse.json(content, { status: 201 })
  } catch (error) {
    console.error('Error creating marquee content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const { id, description, href, textHref } = body

    if (!id) {
      return NextResponse.json({ error: 'Marquee content ID is required' }, { status: 400 })
    }

    const content = await updateMarqueeContent(id, {
      ...(description !== undefined && { description }),
      ...(href !== undefined && { href }),
      ...(textHref !== undefined && { textHref }),
    })
    return NextResponse.json(content)
  } catch (error) {
    console.error('Error updating marquee content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
