import { NextRequest, NextResponse } from 'next/server'
import {
  getFeaturedSection,
  upsertFeaturedSection,
  deleteFeaturedSection,
} from '@/lib/featured-sections'
import { requireAdmin } from '@/lib/auth/require-admin'
import { upsertFeaturedSectionSchema } from '@/lib/validators/featured-section'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slot: string }> }) {
  try {
    const { slot } = await params
    const slotNum = parseInt(slot, 10)
    if (isNaN(slotNum)) {
      return NextResponse.json({ error: 'Invalid slot' }, { status: 400 })
    }
    const section = await getFeaturedSection(slotNum)
    return NextResponse.json(section)
  } catch (error) {
    console.error('Error fetching featured section:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slot: string }> }) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const { slot } = await params
    const slotNum = parseInt(slot, 10)
    if (isNaN(slotNum)) {
      return NextResponse.json({ error: 'Invalid slot' }, { status: 400 })
    }
    const body = await req.json()
    const parsed = upsertFeaturedSectionSchema.parse(body)
    const section = await upsertFeaturedSection(slotNum, parsed)
    return NextResponse.json(section)
  } catch (error) {
    console.error('Error upserting featured section:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slot: string }> }) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const { slot } = await params
    const slotNum = parseInt(slot, 10)
    if (isNaN(slotNum)) {
      return NextResponse.json({ error: 'Invalid slot' }, { status: 400 })
    }
    await deleteFeaturedSection(slotNum)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting featured section:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
