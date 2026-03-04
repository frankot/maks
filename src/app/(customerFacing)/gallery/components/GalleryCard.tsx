import Image from 'next/image'

interface GalleryCardProps {
  imagePath: string
  artistName: string
  onClick?: () => void
  portrait?: boolean
}

export default function GalleryCard({
  imagePath,
  artistName,
  onClick,
  portrait,
}: GalleryCardProps) {
  const heightClass = portrait
    ? 'h-[420px] sm:h-[480px] md:h-[520px] lg:h-[556px]'
    : 'h-[280px] sm:h-[380px] md:h-[480px] lg:h-[556px]'

  return (
    <div className={`relative w-full cursor-pointer ${heightClass}`} onClick={onClick}>
      {/* Image section - full height */}
      <div className="relative h-full overflow-hidden">
        <Image
          src={imagePath}
          alt={artistName}
          fill
          quality={95}
          priority
          className="object-cover transition-transform duration-300 hover:scale-110"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />

        {/* Artist badge - bottom left corner with backdrop blur */}
        <div className="absolute bottom-2 left-2 bg-white/30 px-2 py-1 backdrop-blur-md sm:bottom-3 sm:left-3 sm:px-3 sm:py-1.5">
          <p className="text-[10px] font-light tracking-wider text-black/70 uppercase sm:text-xs">
            {artistName}
          </p>
        </div>
      </div>
    </div>
  )
}
