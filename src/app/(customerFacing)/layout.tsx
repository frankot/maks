import Footer from './_components/Footer';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { CartProvider } from '@/contexts/CartContext';
import Cart from '@/components/Cart';

export default function CustomerFacingLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {/* Nav is now handled per-page for more control */}
      <ErrorBoundary>{children}</ErrorBoundary>
      <Footer />
      <Cart />
    </CartProvider>
  );
}
