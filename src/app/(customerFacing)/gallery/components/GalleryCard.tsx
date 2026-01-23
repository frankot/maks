import Image from 'next/image';

interface GalleryCardProps {
  imagePath: string;
  artistName: string;
}

export default function GalleryCard({ imagePath, artistName }: GalleryCardProps) {
  return (
    <div className="w-full h-[556px] relative">
      {/* Image section - full height */}
      <div className="relative h-full overflow-hidden">
        <Image
          src={imagePath}
          alt={artistName}
          fill
          className="object-cover transition-transform duration-300 hover:scale-110"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        
        {/* Artist badge - bottom right corner with backdrop blur */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 backdrop-blur-md bg-white/30 ">
          <p className="text-xs font-light text-black/70 uppercase tracking-wider">
            cobre.tti
          </p>
        </div>
      </div>
    </div>
  );
}
