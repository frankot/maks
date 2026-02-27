import type { Metadata } from 'next'
import PageWithHeroBar from '../_components/PageWithHeroBar'
import ContactForm from './_components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with MAMI. Questions about orders, custom pieces, or collaborations — we would love to hear from you.',
  alternates: { canonical: 'https://mami.com.pl/contact' },
}

export default function ContactPage() {
  return (
    <>
      <PageWithHeroBar imagePath="/about_bg.jpg" imageAlt="Contact">
        <span className="text-xs tracking-widest whitespace-nowrap text-gray-500 uppercase transition-colors">
          GET IN TOUCH
        </span>
        <div className="mx-2 h-4 w-px bg-gray-300" />
        <span className="text-xs font-light tracking-[0.3em] whitespace-nowrap text-black">
          mami
        </span>
      </PageWithHeroBar>

      <section className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <h2 className="text-center text-2xl font-medium tracking-tight uppercase md:text-3xl">
          Contact Us
        </h2>
        <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-gray-500">
          Have a question about an order, a custom piece, or a collaboration? Drop us a line and
          we&rsquo;ll get back to you as soon as possible.
        </p>

        <ContactForm />
      </section>
    </>
  )
}
