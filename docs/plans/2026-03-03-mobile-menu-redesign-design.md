# Mobile Menu Redesign

## Overview

Replace the current mobile overlay menu in `Nav.tsx` with a full-screen slide-from-top menu. Add a Shop category dropdown and an integrated mini cart section at the bottom. Refactor `Cart.tsx` to extract shared item rendering into a reusable `CartItemList` component.

## Layout

```
┌──────────────────────────────┐
│  mami              [X close] │  Header with brand + close
├──────────────────────────────┤
│  SHOP                    [v] │  Expandable accordion
│    Rings                     │
│    Necklaces                 │
│    Earrings                  │
│  ABOUT                       │
│  GALLERY                     │
│  CONTACT                     │
│         (flex spacer)        │
├──────────────────────────────┤
│  CART (2)                    │  Mini cart section
│  ┌────┐ Ring name    120 zł  │
│  │ img│                  [x] │
│  ┌────┐ Necklace      80 zł │
│  │ img│                  [x] │
│  ─────────────────────────── │
│  Subtotal          200.00 zł │
│  [ ■■■ CHECKOUT ■■■■■■■■■ ] │
└──────────────────────────────┘
```

## Architecture

### New component: `CartItemList`

Extracted from `Cart.tsx` — renders cart item rows with image, name, price, and remove button. Accepts a `compact` prop for the mini cart variant (smaller images, tighter spacing).

Used by:

- `Cart.tsx` (Sheet-based, full version) — `compact={false}`
- `MobileMenu` in `Nav.tsx` (inline, mini version) — `compact={true}`

### Mobile menu changes in `Nav.tsx`

- Replace the current centered overlay with a full-screen panel (`fixed inset-0`)
- Slide-from-top animation via `translate-y` CSS transition
- Shop link becomes an accordion that expands to show Rings, Necklaces, Earrings
- Category links use existing `scrollToSection` for `/shop` or navigate to `/shop#category`
- Mini cart section pinned at bottom with scrollable item list, subtotal, and Checkout button
- Checkout navigates directly to `/checkout`
- Body scroll locked when menu is open

### Cart.tsx changes

- Extract item row rendering into `CartItemList` component (new file: `src/components/CartItemList.tsx`)
- `Cart.tsx` imports and uses `CartItemList` with `compact={false}`
- Keep Sheet, header, footer, empty state in `Cart.tsx`

## Files affected

- `src/components/CartItemList.tsx` — NEW, shared cart item list
- `src/components/Cart.tsx` — refactored to use CartItemList
- `src/app/(customerFacing)/_components/Nav.tsx` — new full-screen mobile menu with shop dropdown and mini cart
