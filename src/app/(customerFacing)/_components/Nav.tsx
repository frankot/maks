'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NavCarousel from './NavCarousel'
import { useCartStore } from '@/stores/cart-store'
import { useNavStore } from '@/stores/nav-store'
import { formatCartPrice } from '@/lib/cart'

const navLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
]

interface Collection {
  id: string
  name: string
  slug: string
}

interface NavProps {
  showCollectionsBar?: boolean
}

export default function Nav({ showCollectionsBar = false }: NavProps) {
  const [collections, setCollections] = useState<Collection[]>([])
  const { showNav, setShowNav } = useNavStore()
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const openCart = useCartStore((s) => s.openCart)
  const totalItems = useCartStore((s) => s.totalItems)
  const [shopExpanded, setShopExpanded] = useState(false)
  const items = useCartStore((s) => s.items)
  const totalPriceInCents = useCartStore((s) => s.totalPriceInCents)

  const currentCollection = searchParams?.get('collection')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('/api/collections')
        if (response.ok) {
          const data = await response.json()
          setCollections(data)
        }
      } catch (error) {
        console.error('Error fetching collections:', error)
      }
    }
    fetchCollections()
  }, [])

  // Handle scroll behavior on desktop only
  useEffect(() => {
    const handleScroll = () => {
      const isMobile = window.innerWidth < 768

      // Always show nav on mobile
      if (isMobile) {
        setShowNav(true)
        return
      }

      const currentScrollY = window.scrollY
      const viewportHeight = window.innerHeight

      if (currentScrollY < 100) {
        // Always show nav at the top
        setShowNav(true)
      } else if (currentScrollY < viewportHeight) {
        // Always show nav if not scrolled past first page (100vh)
        setShowNav(true)
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down (only hide after 100vh)
        setShowNav(false)
      } else {
        // Scrolling up
        setShowNav(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, setShowNav])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  // Handle scroll to section on page load if hash is present
  useEffect(() => {
    if (pathname === '/shop' && typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1)
      if (hash) {
        // Wait for content to load
        setTimeout(() => {
          const element = document.getElementById(hash)
          if (element) {
            // account for fixed nav + collections bar height
            const navH =
              parseFloat(
                getComputedStyle(document.documentElement).getPropertyValue('--nav-height')
              ) || 0
            const colH =
              parseFloat(
                getComputedStyle(document.documentElement).getPropertyValue(
                  '--collections-bar-height'
                )
              ) || 0
            const targetY = element.getBoundingClientRect().top + window.scrollY - (navH + colH)
            window.scrollTo({ top: targetY, behavior: 'smooth' })
          }
        }, 100)
      }
    }
  }, [pathname])

  const scrollToSection = (id: string) => {
    // Check if we're on the shop page
    if (pathname === '/shop') {
      const element = document.getElementById(id)
      if (element) {
        const navH =
          parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) ||
          0
        const colH =
          parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue('--collections-bar-height')
          ) || 0
        const targetY = element.getBoundingClientRect().top + window.scrollY - (navH + colH)
        window.scrollTo({ top: targetY, behavior: 'smooth' })
      }
    } else {
      // Navigate to shop page with hash for scroll target
      window.location.href = `/shop#${id}`
    }
  }

  return (
    <>
      {/* Fixed main nav */}
      <nav
        className={`fixed top-0 right-0 left-0 z-50 w-full bg-white transition-transform duration-300 ${
          !showNav ? '-translate-y-full' : 'translate-y-0'
        }`}
        role="navigation"
        aria-label="Main Navigation"
      >
        <NavCarousel />
        <div className="mx-auto px-4">
          <div className="relative flex h-14 items-center md:pr-16 lg:h-24">
            {/* Center group: brand + nav (desktop centered) */}
            <div className="flex w-full items-center justify-center gap-4 md:gap-8">
              <Link
                href="/"
                className="block text-lg font-extrabold tracking-[0.3em] whitespace-nowrap text-black md:text-4xl"
              >
                mami
              </Link>

              {/* Desktop nav links, hidden on mobile */}
              <div className="hidden items-center gap-6 md:flex">
                {navLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`text-xs tracking-wider uppercase hover:text-black md:text-sm ${
                      pathname === l.href
                        ? 'border-t border-gray-400 pt-0.5 text-black'
                        : 'text-black/90'
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile burger menu button - absolute at right */}
            <div className="absolute inset-y-0 right-4 flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
                className="text-black hover:text-gray-700"
              >
                <MenuIcon size={20} />
              </button>
            </div>

            {/* Desktop cart: absolute at right-6 */}
            <div className="absolute inset-y-0 right-6 hidden items-center md:flex">
              <button
                onClick={openCart}
                aria-label="Open cart"
                className="relative text-black hover:text-gray-700"
              >
                <CartIcon size={32} />
                {isMounted && totalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-medium text-white">
                    {totalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Remove mobile nav links - they're now in burger menu */}
        </div>
      </nav>

      {/* Full-screen mobile menu */}
      <div
        className={`fixed inset-0 z-[60] flex flex-col bg-white transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* Header */}
        <div className="px-4">
          <div className="relative flex h-14 items-center">
            <div className="flex w-full items-center justify-center gap-4">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-lg font-extrabold tracking-[0.3em] whitespace-nowrap text-black"
              >
                mami
              </Link>
            </div>
            <div className="absolute inset-y-0 right-4 flex items-center">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-black transition-colors hover:text-gray-600"
                aria-label="Close menu"
              >
                <XIcon size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto border-t border-gray-200 px-6 pt-6">
          <nav className="flex flex-col gap-1">
            {/* Shop with accordion */}
            <div>
              <button
                onClick={() => setShopExpanded(!shopExpanded)}
                className={`flex w-full items-center justify-between py-3 text-base tracking-wider uppercase transition-colors ${
                  pathname?.startsWith('/shop') ? 'font-medium text-black' : 'text-black/80'
                }`}
              >
                Shop
                <ChevronIcon expanded={shopExpanded} />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  shopExpanded ? 'max-h-40' : 'max-h-0'
                }`}
              >
                <div className="flex flex-col gap-1 pb-2 pl-4">
                  <Link
                    href="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 text-sm tracking-wider text-gray-500 uppercase transition-colors hover:text-black"
                  >
                    All
                  </Link>
                  {['rings', 'necklaces', 'earrings'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setMobileMenuOpen(false)
                        scrollToSection(cat)
                      }}
                      className="py-2 text-left text-sm tracking-wider text-gray-500 uppercase transition-colors hover:text-black"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Other nav links */}
            {navLinks
              .filter((l) => l.href !== '/shop')
              .map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-3 text-base tracking-wider uppercase transition-colors hover:text-gray-600 ${
                    pathname === l.href ? 'font-medium text-black' : 'text-black/80'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
          </nav>
        </div>

        {/* Mini cart section */}
        <div className="border-t border-gray-200 px-6 py-3">
          {isMounted && items.length > 0 ? (
            <>
              <div className="max-h-28 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between py-1 text-xs text-black/80"
                  >
                    <span className="mr-3 truncate">{item.name}</span>
                    <span className="shrink-0 font-medium">
                      {formatCartPrice(item.priceInCents)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2 text-xs">
                <span className="font-medium tracking-wide uppercase">Total ({items.length})</span>
                <span className="font-bold">{formatCartPrice(totalPriceInCents())}</span>
              </div>
              <a
                href="/checkout"
                className="mt-2 block w-full bg-black py-2.5 text-center text-[11px] font-medium tracking-wider text-white uppercase hover:bg-gray-900"
              >
                Checkout
              </a>
            </>
          ) : (
            <p className="py-1 text-xs text-gray-400">Your cart is empty</p>
          )}
        </div>
      </div>

      {/* Collections bar - fixed for product pages, sticky for shop page */}
      {showCollectionsBar && (
        <div className="fixed top-14 right-0 left-0 z-40 border-b border-gray-200 bg-white lg:top-24">
          <div className="py-3">
            <div className="scrollbar-hide mx-auto flex max-w-7xl items-center justify-center gap-8 overflow-x-auto px-4">
              {/* Categories */}
              <button
                onClick={() => scrollToSection('rings')}
                className="text-xs tracking-widest whitespace-nowrap text-gray-500 uppercase transition-colors hover:text-black"
              >
                Rings
              </button>
              <button
                onClick={() => scrollToSection('necklaces')}
                className="text-xs tracking-widest whitespace-nowrap text-gray-500 uppercase transition-colors hover:text-black"
              >
                Necklaces
              </button>
              <button
                onClick={() => scrollToSection('earrings')}
                className="text-xs tracking-widest whitespace-nowrap text-gray-500 uppercase transition-colors hover:text-black"
              >
                Earrings
              </button>

              <div className="mx-2 h-4 w-px bg-gray-300" />

              <Link
                href="/shop"
                className={`text-xs tracking-widest whitespace-nowrap uppercase transition-colors ${
                  !currentCollection ? 'font-bold text-black' : 'text-gray-500 hover:text-black'
                }`}
              >
                All
              </Link>

              {collections.map((c) => (
                <Link
                  key={c.id}
                  href={`/shop/${c.slug}`}
                  className={`text-xs tracking-widest whitespace-nowrap uppercase transition-colors ${
                    currentCollection === c.slug
                      ? 'font-bold text-black'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating cart button - bottom right corner */}
      <button
        onClick={openCart}
        aria-label="Open cart"
        className="fixed right-6 bottom-6 z-50 flex h-12 w-12 items-center justify-center border border-black bg-white text-black shadow-lg transition-all hover:bg-black hover:text-white active:scale-95 md:hidden"
      >
        <CartIcon size={18} />
        {isMounted && totalItems() > 0 && (
          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
            {totalItems()}
          </span>
        )}
      </button>
    </>
  )
}

function CartIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <rect
          x="5"
          y="7"
          width="14"
          height="12"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

function MenuIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 12H21M3 6H21M3 18H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronIcon({ expanded, size = 16 }: { expanded: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function XIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 6L6 18M6 6L18 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
