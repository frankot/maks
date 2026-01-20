import Nav from '../_components/Nav';
import PageWithHeroBar from '../_components/PageWithHeroBar';
import Gallery from '../_components/Gallery';
import { Suspense } from 'react';

export default function GalleryPage() {
  return (
    <>
      <Suspense fallback={null}>
        <Nav />
      </Suspense>

      {/* Hero + Bar Wrapper */}
      <PageWithHeroBar imagePath="/gall_bg.jpg" imageAlt="Gallery" title="GALLERY">
        <span className="text-xs tracking-widest whitespace-nowrap text-gray-500 uppercase transition-colors">
          GALLERY
        </span>
        <div className="mx-2 h-4 w-px bg-gray-300" />
        <span className="text-xs tracking-widest whitespace-nowrap uppercase font-bold text-black">
          SPLOT STUDIO
        </span>
      </PageWithHeroBar>

      {/* Gallery content */}
      <Gallery />
    </>
  );
}
