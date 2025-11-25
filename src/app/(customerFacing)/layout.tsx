import Footer from './_components/Footer';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function CustomerFacingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Nav is now handled per-page for more control */}
      <ErrorBoundary>{children}</ErrorBoundary>
      <Footer />
    </>
  );
}
