import type { Metadata } from 'next'
import Link from 'next/link'
import PageWithHeroBar from '../../_components/PageWithHeroBar'

export const metadata: Metadata = {
  title: 'Payment Cancelled',
  description: 'Your payment was cancelled. Your cart items are still saved.',
}

export default function CheckoutCancelPage() {
  return (
    <>
      <PageWithHeroBar imagePath="/about_bg.webp" imageAlt="Payment Cancelled">
        <span className="text-xs tracking-widest whitespace-nowrap text-gray-500 uppercase transition-colors">
          CHECKOUT
        </span>
        <div className="mx-2 h-4 w-px bg-gray-300" />
        <span className="text-xs font-light tracking-[0.3em] whitespace-nowrap text-black">
          cancelled
        </span>
      </PageWithHeroBar>

      <section className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <h2 className="text-center text-2xl font-medium tracking-tight uppercase md:text-3xl">
          Payment Cancelled
        </h2>
        <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-gray-500">
          Your payment was not completed. Don&rsquo;t worry&nbsp;&mdash; your cart items are still
          saved and ready for you whenever you&rsquo;d like to continue.
        </p>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/checkout"
            className="w-full border border-black bg-transparent py-3 text-center text-xs font-medium tracking-widest uppercase transition-colors hover:bg-gray-100 sm:w-auto sm:px-10"
          >
            Return to Checkout
          </Link>
          <Link
            href="/shop"
            className="w-full bg-black py-3 text-center text-xs font-medium tracking-widest text-white uppercase transition-colors hover:bg-gray-900 sm:w-auto sm:px-10"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    </>
  )
}
