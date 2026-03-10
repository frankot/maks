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
        <p className="text-center text-xs tracking-[0.3em] text-gray-500 uppercase">
          Checkout Update
        </p>
        <h2 className="mt-3 text-center text-2xl font-medium tracking-tight uppercase md:text-3xl">
          Payment Cancelled
        </h2>
        <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-gray-500">
          Your payment was not completed. Don&rsquo;t worry&nbsp;&mdash; your cart items are still
          saved and ready for you whenever you&rsquo;d like to continue.
        </p>

        <div className="mt-12 border-y border-gray-200 py-6">
          <div className="space-y-3 text-center">
            <p className="text-xs tracking-wider text-gray-500 uppercase">What happens next</p>
            <p className="text-sm leading-relaxed text-gray-600">
              Nothing has been charged. Your selected pieces are still in your cart, so you can
              return to checkout whenever you&rsquo;re ready.
            </p>
            <p className="text-sm leading-relaxed text-gray-600">
              If something went wrong during payment and you need help, reach out and we&rsquo;ll help
              you finish the order.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/checkout"
            className="w-full border border-black bg-transparent px-10 py-3 text-center text-xs font-medium tracking-widest uppercase transition-colors hover:bg-gray-100 sm:w-auto"
          >
            Return to Checkout
          </Link>
          <Link
            href="/shop"
            className="w-full bg-black px-10 py-3 text-center text-xs font-medium tracking-widest text-white uppercase transition-colors hover:bg-gray-900 sm:w-auto"
          >
            Continue Shopping
          </Link>
        </div>

        <p className="mt-8 text-center text-xs leading-relaxed text-gray-500">
          Need assistance?{' '}
          <Link href="/contact" className="underline underline-offset-4 transition-colors hover:text-black">
            Contact us
          </Link>
          .
        </p>
      </section>
    </>
  )
}
