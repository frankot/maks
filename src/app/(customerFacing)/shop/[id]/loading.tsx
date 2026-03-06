export default function ShopSubpageLoading() {
  return (
    <>
      {/* Hero + Collections Bar skeleton */}
      <div className="relative h-[120px] w-full animate-pulse bg-gray-100 lg:h-[400px]" />
      <div className="sticky top-20 z-40 border-b border-gray-200 bg-white lg:top-30">
        <div className="py-3">
          <div className="mx-auto flex max-w-6xl items-center gap-8 px-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 w-16 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        </div>
      </div>

      {/* Minimal product grid skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-full animate-pulse">
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-100" />
              <div className="flex items-center justify-between px-4 pt-3 pb-3">
                <div className="flex-1">
                  <div className="mb-2 h-4 w-3/4 rounded bg-gray-100" />
                  <div className="h-3 w-1/2 rounded bg-gray-100" />
                </div>
                <div className="ml-4 h-3 w-16 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
