export default function ProductSkeleton() {
  return (
    <div className="w-full animate-pulse">
      {/* Image skeleton */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100" />
      
      {/* Product info skeleton */}
      <div className="flex items-center justify-between px-4 pb-3 pt-3">
        <div className="flex-1">
          {/* Product name */}
          <div className="h-4 w-3/4 bg-gray-100 rounded mb-2" />
          {/* Materials */}
          <div className="h-3 w-1/2 bg-gray-100 rounded" />
        </div>
        {/* Price */}
        <div className="h-3 w-16 bg-gray-100 rounded ml-4" />
      </div>
    </div>
  );
}
