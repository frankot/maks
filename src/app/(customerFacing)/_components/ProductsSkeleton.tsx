import ProductSkeleton from './ProductSkeleton'

export default function ProductsSkeleton() {
  return (
    <div className="space-y-16 py-12">
      {/* Rings Section */}
      <section id="rings" className="scroll-mt-[104px] lg:scroll-mt-[144px]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-10 w-32 animate-pulse rounded bg-gray-100" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={`rings-skeleton-${i}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Necklaces Section */}
      <section id="necklaces" className="scroll-mt-[104px] lg:scroll-mt-[144px]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-10 w-40 animate-pulse rounded bg-gray-100" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={`necklaces-skeleton-${i}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Earrings Section */}
      <section id="earrings" className="scroll-mt-[104px] lg:scroll-mt-[144px]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-10 w-36 animate-pulse rounded bg-gray-100" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={`earrings-skeleton-${i}`} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
