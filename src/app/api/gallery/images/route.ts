import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { createGalleryImage, deleteGalleryImage } from '@/lib/gallery'
import { requireAdmin } from '@/lib/auth/require-admin'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const { imagePath, publicId, order, artistId, rowId } = body

    if (!imagePath || !publicId || order === undefined || !artistId || !rowId) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const image = await createGalleryImage({
      imagePath,
      publicId,
      order,
      artistId,
      rowId,
    })
    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error('Error creating gallery image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 })
    }

    const image = await deleteGalleryImage(id)

    // Clean up Cloudinary
    try {
      await cloudinary.uploader.destroy(image.publicId)
    } catch {
      // Continue even if Cloudinary cleanup fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting gallery image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
