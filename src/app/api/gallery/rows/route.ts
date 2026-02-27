import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import {
  getGalleryRows,
  createGalleryRow,
  deleteGalleryRow,
  getGalleryImagesByRowId,
} from '@/lib/gallery'
import type { GalleryLayout } from '@prisma/client'
import { requireAdmin } from '@/lib/auth/require-admin'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET() {
  try {
    const rows = await getGalleryRows()
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching gallery rows:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const { layout, order } = body

    if (!layout || !['THREE_COL', 'FIVE_COL'].includes(layout)) {
      return NextResponse.json(
        { error: 'Valid layout is required (THREE_COL or FIVE_COL)' },
        { status: 400 }
      )
    }

    const row = await createGalleryRow({
      layout: layout as GalleryLayout,
      order: order ?? 0,
    })
    return NextResponse.json(row, { status: 201 })
  } catch (error) {
    console.error('Error creating gallery row:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Row ID is required' }, { status: 400 })
    }

    // Get images before deleting to clean up Cloudinary
    const images = await getGalleryImagesByRowId(id)
    for (const image of images) {
      try {
        await cloudinary.uploader.destroy(image.publicId)
      } catch {
        // Continue even if Cloudinary cleanup fails
      }
    }

    await deleteGalleryRow(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting gallery row:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
