import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPhotoArtists, artistNameToSlug, getGalleryRowsByArtistName } from '@/lib/gallery'
import PageWithHeroBar from '../../_components/PageWithHeroBar'
import ArtistsBar from '../components/ArtistsBar'
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
  const artists = await getPhotoArtists()
  const artist = artists.find((a) => artistNameToSlug(a.name) === slug) ?? null

  if (!artist) {
    notFound()
  }

  const rows = await getGalleryRowsByArtistName(artist.name)

  return (
    <>
      <PageWithHeroBar imagePath="/gall_bg.webp" imageAlt="Gallery">
        <ArtistsBar artists={artists} highlightedArtist={slug} />
      </PageWithHeroBar>

      <ArtistGallery rows={rows} />
    </>
  )
}
