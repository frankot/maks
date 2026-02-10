import Footer from './_components/Footer';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import Cart from '@/components/Cart';
import Nav from './_components/Nav';
import { Suspense } from 'react';
import PreloadProvider from '@/components/PreloadProvider';

export default function CustomerFacingLayout({ children }: { children: React.ReactNode }) {
  return (
    <PreloadProvider>
      <Suspense fallback={null}>
        <Nav />
      </Suspense>
      <ErrorBoundary>{children}</ErrorBoundary>
      <Footer />
      <Cart />
    </PreloadProvider>
  );
}
