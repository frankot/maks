import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HeroCms from './_components/HeroCms';
import MarqueeCms from './_components/MarqueeCms';
import NavCarouselCms from './_components/NavCarouselCms';
import GalleryCms from './_components/GalleryCms';

export default function CmsPage() {
  return (
    <div className="container max-w-5xl mx-auto pt-20 p-6">
      <h1 className="mb-6 text-3xl font-bold">Content Management System</h1>
      <Tabs defaultValue="hero">
        <TabsList>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="marquee">Marquee</TabsTrigger>
          <TabsTrigger value="nav-carousel">NavCarousel</TabsTrigger>
        </TabsList>
        <TabsContent value="hero">
          <HeroCms />
        </TabsContent>
        <TabsContent value="gallery">
          <GalleryCms />
        </TabsContent>
        <TabsContent value="marquee">
          <MarqueeCms />
        </TabsContent>
        <TabsContent value="nav-carousel">
          <NavCarouselCms />
        </TabsContent>
      </Tabs>
    </div>
  );
}
