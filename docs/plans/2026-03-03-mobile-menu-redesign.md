# Mobile Menu Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the mobile menu with a full-screen slide-from-top menu featuring a Shop category dropdown and integrated mini cart, while extracting shared cart item rendering into a reusable component.

**Architecture:** Extract `CartItemList` from `Cart.tsx` as a shared component with compact/full variants. Refactor `Cart.tsx` to use it. Rebuild the mobile menu section of `Nav.tsx` as a full-screen overlay with slide-from-top animation, shop accordion, and inline mini cart.

**Tech Stack:** React 19, Next.js 15 App Router, Zustand (cart-store), Tailwind CSS v4, lucide-react icons

---

### Task 1: Create `CartItemList` shared component

**Files:**

- Create: `src/components/CartItemList.tsx`

**Step 1: Create CartItemList component**

Create a new file `src/components/CartItemList.tsx` with the extracted cart item rendering logic. It accepts `compact` prop for sizing and an `onNavigate` callback for link clicks (so the mobile menu can close itself on navigation).

```tsx
'use client'

import { formatCartPrice } from '@/lib/cart'
import { useCartStore } from '@/stores/cart-store'
import Image from 'next/image'
import Link from 'next/link'
import { X, ShoppingBag } from 'lucide-react'

interface CartItemListProps {
  compact?: boolean
  onNavigate?: () => void
}

export default function CartItemList({ compact = false, onNavigate }: CartItemListProps) {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)

  if (items.length === 0) return null

  return (
    <div className={compact ? 'space-y-3' : 'space-y-6'}>
      {items.map((item) => (
        <div
          key={item.productId}
          className={`flex gap-3 border-b pb-3 last:border-b-0 ${!compact ? 'gap-4 pb-6' : ''}`}
        >
          <Link
            href={`/shop/${item.slug ?? item.productId}`}
            onClick={onNavigate}
            className={`relative flex-shrink-0 bg-gray-100 ${compact ? 'h-14 w-14' : 'h-20 w-20'}`}
          >
            {item.imagePath ? (
              <Image src={item.imagePath} alt={item.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ShoppingBag
                  className={`text-gray-300 ${compact ? 'h-4 w-4' : 'h-6 w-6'}`}
                  strokeWidth={1.5}
                />
              </div>
            )}
          </Link>

          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`/shop/${item.slug ?? item.productId}`}
                onClick={onNavigate}
                className={`font-medium tracking-wide uppercase hover:underline ${compact ? 'text-[11px]' : 'text-xs'}`}
              >
                {item.name}
              </Link>
              <button
                onClick={() => removeItem(item.productId)}
                className="flex-shrink-0 text-gray-400 transition-colors hover:text-black"
                aria-label="Remove item"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            <div className={`text-gray-600 ${compact ? 'text-[11px]' : 'text-xs'}`}>
              {formatCartPrice(item.priceInCents)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/CartItemList.tsx
git commit -m "feat: extract CartItemList shared component"
```

---

### Task 2: Refactor `Cart.tsx` to use `CartItemList`

**Files:**

- Modify: `src/components/Cart.tsx`

**Step 1: Refactor Cart.tsx**

Replace the inline item rendering (lines 44-87) with the new `CartItemList` component. Keep the Sheet wrapper, header, empty state, and footer intact.

Replace:

```tsx
<div className="space-y-6">
  {items.map((item) => (
    // ... all the item rendering JSX
  ))}
</div>
```

With:

```tsx
<CartItemList onNavigate={closeCart} />
```

The empty state check stays in Cart.tsx (show ShoppingBag icon when `items.length === 0`), and CartItemList handles the non-empty rendering.

Updated imports — add `CartItemList`, remove `Image`, `Link`, `X` (still need `ShoppingBag` for empty state).

Full updated `Cart.tsx`:

```tsx
'use client'

import { useCartStore } from '@/stores/cart-store'
import { formatCartPrice } from '@/lib/cart'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import CartItemList from '@/components/CartItemList'

export default function Cart() {
  const { items, isOpen, closeCart, totalPriceInCents } = useCartStore()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className="flex w-full flex-col border-l bg-stone-100 p-0 sm:max-w-lg"
      >
        <div className="mx-2 border-b px-6 py-4">
          <SheetTitle className="text-2xl font-bold tracking-tight uppercase">Cart</SheetTitle>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
              <ShoppingBag className="h-12 w-12 text-gray-300" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium">Your cart is empty</p>
                <p className="mt-2 text-xs text-gray-500">Add items to get started</p>
              </div>
            </div>
          ) : (
            <CartItemList onNavigate={closeCart} />
          )}
        </div>

        {/* Footer with Total and Checkout */}
        {items.length > 0 && (
          <div className="mx-2 space-y-4 border-t px-6 pt-6 pb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium tracking-wide uppercase">Subtotal</span>
              <span className="font-bold">{formatCartPrice(totalPriceInCents())}</span>
            </div>
            <Button
              className="h-12 w-full bg-black text-xs font-medium tracking-wider text-white uppercase hover:bg-gray-900"
              asChild
            >
              <a href="/checkout">Checkout</a>
            </Button>
            <button
              onClick={closeCart}
              className="w-full py-3 text-xs font-medium tracking-wider text-gray-600 uppercase transition-colors hover:text-black"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
```

**Step 2: Verify visually**

Run: `npm run dev`
Check: Open the cart sheet on desktop and mobile — items should render identically to before.

**Step 3: Commit**

```bash
git add src/components/Cart.tsx
git commit -m "refactor: Cart.tsx uses shared CartItemList component"
```

---

### Task 3: Rebuild mobile menu in `Nav.tsx`

**Files:**

- Modify: `src/app/(customerFacing)/_components/Nav.tsx`

**Step 1: Add new state and imports**

Add to existing imports:

```tsx
import CartItemList from '@/components/CartItemList'
import { formatCartPrice } from '@/lib/cart'
```

Add new state inside the `Nav` component:

```tsx
const [shopExpanded, setShopExpanded] = useState(false)
const items = useCartStore((s) => s.items)
const totalPriceInCents = useCartStore((s) => s.totalPriceInCents)
```

**Step 2: Add body scroll lock effect**

Add a new `useEffect` to lock body scrolling when mobile menu is open:

```tsx
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
```

**Step 3: Replace the mobile menu overlay**

Remove the entire `{/* Mobile menu overlay */}` section (lines 233-274 in current Nav.tsx) and replace with the new full-screen mobile menu.

The new menu has three sections in a flex column:

1. **Header** — brand "mami" + close button
2. **Navigation links** — scrollable flex-1 area with Shop accordion + other links
3. **Mini cart** — pinned at bottom with items, subtotal, checkout button

Also remove the `{/* Mobile floating cart button */}` section (lines 215-231) since the cart is now integrated into the menu.

Replace from `{/* Mobile floating cart button */}` through end of `{/* Mobile menu overlay */}` with:

```tsx
{
  /* Full-screen mobile menu */
}
;<div
  className={`fixed inset-0 z-[60] flex flex-col bg-white transition-transform duration-300 ease-in-out md:hidden ${
    mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
  }`}
>
  {/* Header */}
  <div className="flex items-center justify-between px-6 py-5">
    <Link
      href="/"
      onClick={() => setMobileMenuOpen(false)}
      className="text-lg font-extrabold tracking-[0.3em] text-black"
    >
      mami
    </Link>
    <button
      onClick={() => setMobileMenuOpen(false)}
      className="text-black transition-colors hover:text-gray-600"
      aria-label="Close menu"
    >
      <XIcon size={20} />
    </button>
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
  <div className="border-t border-gray-200 px-6 py-4">
    <div className="mb-3 text-xs font-medium tracking-wider text-black uppercase">
      Cart{isMounted && items.length > 0 && ` (${items.length})`}
    </div>

    {isMounted && items.length > 0 ? (
      <>
        <div className="max-h-36 overflow-y-auto">
          <CartItemList compact onNavigate={() => setMobileMenuOpen(false)} />
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 text-sm">
          <span className="font-medium tracking-wide uppercase">Subtotal</span>
          <span className="font-bold">{formatCartPrice(totalPriceInCents())}</span>
        </div>
        <a
          href="/checkout"
          className="mt-3 block w-full bg-black py-3 text-center text-xs font-medium tracking-wider text-white uppercase hover:bg-gray-900"
        >
          Checkout
        </a>
      </>
    ) : (
      <p className="text-xs text-gray-400">Your cart is empty</p>
    )}
  </div>
</div>
```

**Step 4: Add ChevronIcon helper**

Add at the bottom of `Nav.tsx` alongside other icon components:

```tsx
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
```

**Step 5: Verify visually**

Run: `npm run dev`
Check on mobile viewport (< 768px):

- Burger button opens full-screen menu sliding from top
- Shop link expands to show Rings, Necklaces, Earrings
- Category links navigate to `/shop#category` or scroll if already on shop
- Mini cart at bottom shows items, subtotal, checkout button
- Close button dismisses menu
- Background scroll is locked
- All links close menu on click

**Step 6: Commit**

```bash
git add src/app/\(customerFacing\)/_components/Nav.tsx
git commit -m "feat: full-screen mobile menu with shop dropdown and mini cart"
```

---

### Task 4: Final cleanup and build verification

**Files:**

- Review: all modified files

**Step 1: Run lint**

Run: `npm run lint`
Expected: No errors

**Step 2: Run build**

Run: `npm run build`
Expected: Successful build with no type errors

**Step 3: Fix any lint/type issues found**

Address any issues from steps 1-2.

**Step 4: Commit fixes if any**

```bash
git add -A
git commit -m "fix: lint and type fixes for mobile menu redesign"
```
