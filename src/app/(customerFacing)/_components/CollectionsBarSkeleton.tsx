export default function CollectionsBarSkeleton() {
  return (
    <>
      {/* Category placeholders */}
      <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
      <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
      <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />

      <div className="mx-2 h-4 w-px bg-gray-300" />

      {/* Collection placeholders */}
      <div className="h-3 w-8 bg-gray-100 rounded animate-pulse" />
      <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
      <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
    </>
  );
}
