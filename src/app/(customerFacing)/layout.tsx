import Footer from './_components/Footer'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import Cart from '@/components/Cart'
import Nav from './_components/Nav'
import { Suspense } from 'react'

export default function CustomerFacingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <Nav />
      </Suspense>
      <div className="pt-24 lg:pt-32">
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
      <Footer />
      <Cart />
    </>
  )
}
