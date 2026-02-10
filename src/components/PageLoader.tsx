'use client';

interface PageLoaderProps {
  isLoading: boolean;
}

export default function PageLoader({ isLoading }: PageLoaderProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
      {/* Brand text */}
      <h1 className="mb-8 text-4xl font-light tracking-[0.3em] text-gray-900">mami</h1>

      {/* Spinning wheel animation */}
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
    </div>
  );
}
