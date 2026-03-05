import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getPhotoArtists, artistNameToSlug, getGalleryRowsByArtistName } from '@/lib/gallery'
import PageWithHeroBar from '../../_components/PageWithHeroBar'
import ArtistsBar from '../components/ArtistsBar'
import ArtistsBarSkeleton from '../components/ArtistsBarSkeleton'
import ArtistGallery from '../components/ArtistGallery'

interface ArtistPageProps {
  params: Promise<{ artist: string }>
}

async function findArtistBySlug(slug: string) {
  const artists = await getPhotoArtists()
  return artists.find((a) => artistNameToSlug(a.name) === slug) ?? null
}

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const { artist: slug } = await params
  const artist = await findArtistBySlug(slug)

  if (!artist) {
    return { title: 'Artist Not Found' }
  }

  return {
    title: `${artist.name} — Gallery`,
    description: `Browse gallery photos by ${artist.name} — editorial photography showcasing handmade jewelry by MAMI.`,
    alternates: { canonical: `https://mami.com.pl/gallery/${slug}` },
  }
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { artist: slug } = await params
  const artist = await findArtistBySlug(slug)

  if (!artist) {
    notFound()
  }

  const rows = await getGalleryRowsByArtistName(artist.name)

  return (
    <>
      <PageWithHeroBar imagePath="/gall_bg.webp" imageAlt="Gallery">
        <Suspense fallback={<ArtistsBarSkeleton />}>
          <ArtistsBar highlightedArtist={slug} />
        </Suspense>
      </PageWithHeroBar>

      <ArtistGallery rows={rows} />
    </>
  )
}
