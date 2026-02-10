import type { Metadata } from 'next';
import PageWithHeroBar from '../_components/PageWithHeroBar';
import Gallery from './components/Gallery';

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Browse the MAMI gallery — editorial photography showcasing our handmade jewelry pieces, studio sessions, and behind-the-scenes craftsmanship.',
  alternates: { canonical: 'https://mami.com.pl/gallery' },
};

export default function GalleryPage() {
  return (
    <>
      {/* Hero + Bar Wrapper */}
      <PageWithHeroBar imagePath="/gall_bg.jpg" imageAlt="Gallery">
        <span className="text-xs tracking-widest whitespace-nowrap text-gray-500 uppercase transition-colors">
          GALLERY
        </span>
        <div className="mx-2 h-4 w-px bg-gray-300" />
        <span className="text-xs font-bold tracking-widest whitespace-nowrap text-black uppercase">
          SPLOT STUDIO
        </span>
      </PageWithHeroBar>

      {/* Gallery content */}
      <Gallery />
    </>
  );
}
