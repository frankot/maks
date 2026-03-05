import type { Metadata } from 'next'
import { getPhotoArtists } from '@/lib/gallery'
import PageWithHeroBar from '../_components/PageWithHeroBar'
import Gallery from './components/Gallery'
import ArtistsBar from './components/ArtistsBar'

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Browse the MAMI gallery — editorial photography showcasing our handmade jewelry pieces, studio sessions, and behind-the-scenes craftsmanship.',
  alternates: { canonical: 'https://mami.com.pl/gallery' },
}

export default async function GalleryPage() {
  const artists = await getPhotoArtists()

  return (
    <>
      {/* Hero + Bar Wrapper */}
      <PageWithHeroBar imagePath="/gall_bg.webp" imageAlt="Gallery">
        <ArtistsBar artists={artists} />
      </PageWithHeroBar>

      {/* Gallery content */}
      <Gallery />
    </>
  )
}
