export default function ProductSkeleton() {
  return (
    <div className="w-full animate-pulse">
      {/* Image skeleton */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100" />

      {/* Product info skeleton */}
      <div className="flex items-center justify-between px-4 pt-3 pb-3">
        <div className="flex-1">
          {/* Product name */}
          <div className="mb-2 h-4 w-3/4 rounded bg-gray-100" />
          {/* Materials */}
          <div className="h-3 w-1/2 rounded bg-gray-100" />
        </div>
        {/* Price */}
        <div className="ml-4 h-3 w-16 rounded bg-gray-100" />
      </div>
    </div>
  )
}
