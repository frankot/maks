import { prisma } from './prisma'
import type { GalleryRow, GalleryImage, PhotoArtist, GalleryLayout } from '@prisma/client'

// --- Gallery Rows ---

export type GalleryRowWithImages = GalleryRow & {
  images: (GalleryImage & { artist: PhotoArtist })[]
}

export async function getGalleryRows(): Promise<GalleryRowWithImages[]> {
  try {
    const rows = await prisma.galleryRow.findMany({
      orderBy: { order: 'desc' },
      include: {
        images: {
          orderBy: { order: 'asc' },
          include: { artist: true },
        },
      },
    })
    return rows
  } catch (error) {
    console.error('Error fetching gallery rows:', error)
    throw error
  }
}

export async function createGalleryRow(data: {
  layout: GalleryLayout
  order: number
}): Promise<GalleryRow> {
  try {
    const row = await prisma.galleryRow.create({ data })
    return row
  } catch (error) {
    console.error('Error creating gallery row:', error)
    throw error
  }
}

export async function deleteGalleryRow(id: string): Promise<void> {
  try {
    await prisma.galleryRow.delete({ where: { id } })
  } catch (error) {
    console.error('Error deleting gallery row:', error)
    throw error
  }
}

// --- Gallery Images ---

export async function createGalleryImage(data: {
  imagePath: string
  publicId: string
  order: number
  artistId: string
  rowId: string
}): Promise<GalleryImage> {
  try {
    const image = await prisma.galleryImage.create({ data })
    return image
  } catch (error) {
    console.error('Error creating gallery image:', error)
    throw error
  }
}

export async function deleteGalleryImage(id: string): Promise<GalleryImage> {
  try {
    const image = await prisma.galleryImage.delete({ where: { id } })
    return image
  } catch (error) {
    console.error('Error deleting gallery image:', error)
    throw error
  }
}

// --- Photo Artists ---

export async function getPhotoArtists(): Promise<PhotoArtist[]> {
  try {
    const artists = await prisma.photoArtist.findMany({
      orderBy: { name: 'asc' },
    })
    return artists
  } catch (error) {
    console.error('Error fetching photo artists:', error)
    throw error
  }
}

export async function createPhotoArtist(name: string): Promise<PhotoArtist> {
  try {
    const artist = await prisma.photoArtist.create({ data: { name } })
    return artist
  } catch (error) {
    console.error('Error creating photo artist:', error)
    throw error
  }
}

export async function deletePhotoArtist(id: string): Promise<void> {
  try {
    const imageCount = await prisma.galleryImage.count({ where: { artistId: id } })
    if (imageCount > 0) {
      throw new Error('ARTIST_HAS_IMAGES')
    }
    await prisma.photoArtist.delete({ where: { id } })
  } catch (error) {
    console.error('Error deleting photo artist:', error)
    throw error
  }
}

export async function getGalleryImagesByRowId(rowId: string): Promise<GalleryImage[]> {
  try {
    const images = await prisma.galleryImage.findMany({
      where: { rowId },
    })
    return images
  } catch (error) {
    console.error('Error fetching gallery images by row:', error)
    throw error
  }
}
