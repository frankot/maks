export default function CollectionsBarSkeleton() {
  return (
    <>
      {/* Category placeholders */}
      <div className="h-3 w-12 animate-pulse rounded bg-gray-100" />
      <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
      <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />

      <div className="mx-2 h-4 w-px bg-gray-300" />

      {/* Collection placeholders */}
      <div className="h-3 w-8 animate-pulse rounded bg-gray-100" />
      <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
      <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
    </>
  )
}
