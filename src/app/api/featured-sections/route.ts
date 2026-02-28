import { NextResponse } from 'next/server'
import { getFeaturedSection } from '@/lib/featured-sections'

export const revalidate = 3600

export async function GET() {
  try {
    const [slot1, slot2] = await Promise.all([getFeaturedSection(1), getFeaturedSection(2)])
    return NextResponse.json({ slot1, slot2 })
  } catch (error) {
    console.error('Error fetching featured sections:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
