'use client';

import { useEffect, useState } from 'react';
import PageLoader from '@/components/PageLoader';
import { preloadAllCriticalImages } from '@/lib/image-preloader';

interface PreloadProviderProps {
  children: React.ReactNode;
}

export default function PreloadProvider({ children }: PreloadProviderProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      try {
        await preloadAllCriticalImages();
      } catch (error) {
        console.error('Preload error:', error);
      } finally {
        // Add minimum loading time for smooth UX (optional)
        const minLoadTime = 500; // 500ms minimum
        setTimeout(() => {
          setIsLoading(false);
        }, minLoadTime);
      }
    };

    void loadImages();
  }, []);

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <div className={isLoading ? 'invisible' : 'visible'}>{children}</div>
    </>
  );
}
