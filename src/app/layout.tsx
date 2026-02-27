import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://mami.com.pl'),
  title: {
    default: 'MAMI — Handmade Jewelry from Warsaw',
    template: '%s | MAMI',
  },
  description:
    'MAMI is a jewelry brand founded by Maks Michalak in 2024, based in Warsaw, Poland. Organic yet bold — natural forms, raw and cut stones, molten designs and a sparkle of luxury.',
  keywords: [
    'handmade jewelry',
    'Warsaw jewelry',
    'Polish jewelry brand',
    'MAMI jewelry',
    'artisan rings',
    'handmade necklaces',
    'handmade earrings',
    'unique jewelry',
    'organic jewelry',
    'luxury jewelry Poland',
  ],
  authors: [{ name: 'MAMI' }],
  creator: 'MAMI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'pl_PL',
    url: 'https://mami.com.pl',
    siteName: 'MAMI',
    title: 'MAMI — Handmade Jewelry from Warsaw',
    description:
      'Organic yet bold jewelry. Natural forms, raw and cut stones, molten designs and a sparkle of luxury on yourself.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MAMI — Handmade Jewelry from Warsaw',
    description:
      'Organic yet bold jewelry. Natural forms, raw and cut stones, molten designs and a sparkle of luxury on yourself.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://mami.com.pl',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-neu bg-white text-black antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
