import { auth } from '@/auth'
import Footer from './_components/Footer'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import Cart from '@/components/Cart'
import Nav from './_components/Nav'
import { Suspense } from 'react'

export default async function CustomerFacingLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) {
    return (
      <div className="fixed inset-0 z-[9999] flex h-screen w-screen overflow-hidden bg-white text-black">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-6 text-center">
          <p className="text-4xl font-extrabold tracking-[0.18em]  sm:text-8xl">mami</p>
          <p className="mt-10 text-xl font-medium tracking-[0.3em] uppercase sm:text-2xl">Coming Soon</p>
        </div>
      </div>
    )
  }

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
