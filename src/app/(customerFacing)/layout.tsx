import Footer from './_components/Footer';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { CartProvider } from '@/contexts/CartContext';
import { NavProvider } from '@/contexts/NavContext';
import Cart from '@/components/Cart';
import Nav from './_components/Nav';
import { Suspense } from 'react';

export default function CustomerFacingLayout({ children }: { children: React.ReactNode }) {
  return (
    <NavProvider>
      <CartProvider>
        <Suspense fallback={null}>
          <Nav />
        </Suspense>
        <ErrorBoundary>{children}</ErrorBoundary>
        <Footer />
        <Cart />
      </CartProvider>
    </NavProvider>
  );
}
