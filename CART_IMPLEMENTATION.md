# Cart System Documentation

## Overview

A minimalistic, Shopify-inspired cart system with:
- Sliding panel from the right (using shadcn/ui Sheet)
- localStorage persistence across sessions
- Real-time cart state management
- Item count badge on navigation
- Add to cart with animation feedback

## Components

### 1. Cart Context (`src/contexts/CartContext.tsx`)
Manages global cart state with localStorage persistence.

**Features:**
- Add/remove/update items
- Calculate totals automatically
- Open/close cart panel
- Persist cart data across page reloads

**Usage:**
```tsx
import { useCart } from '@/contexts/CartContext';

function MyComponent() {
  const { cart, addItem, removeItem, updateQuantity, openCart } = useCart();
  
  // Access cart data
  console.log(cart.items); // Array of cart items
  console.log(cart.totalItems); // Total quantity
  console.log(cart.totalPriceInCents); // Total price
}
```

### 2. Cart Component (`src/components/Cart.tsx`)
The sliding panel displaying cart contents.

**Features:**
- Empty state with icon
- Product thumbnails and details
- Quantity controls (+/-)
- Remove item button
- Subtotal display
- Checkout button
- Continue shopping link

### 3. AddToCartButton (`src/components/AddToCartButton.tsx`)
Used on product detail pages.

**Features:**
- Adds item to cart
- Shows "Added" confirmation
- Auto-opens cart after adding
- Customizable styling

**Usage:**
```tsx
import AddToCartButton from '@/components/AddToCartButton';

<AddToCartButton
  product={{
    id: product.id,
    name: product.name,
    priceInGrosz: product.priceInGrosz,
    imagePath: product.imagePaths[0],
    slug: product.slug,
  }}
  className="custom-styles"
/>
```

### 4. QuickAddButton (`src/components/QuickAddButton.tsx`)
Used in product grids/listings for quick add functionality.

**Features:**
- Adds without navigation
- Prevents event bubbling
- Compact design for grids

**Usage:**
```tsx
import QuickAddButton from '@/components/QuickAddButton';

<QuickAddButton
  product={{
    id: product.id,
    name: product.name,
    priceInGrosz: product.priceInGrosz,
    imagePath: product.imagePaths[0],
    slug: product.slug,
  }}
/>
```

## Integration

### Layout Setup
The CartProvider wraps the customer-facing layout:

```tsx
// src/app/(customerFacing)/layout.tsx
<CartProvider>
  {children}
  <Cart />
</CartProvider>
```

### Navigation Integration
Cart icon with badge in Nav component:

```tsx
const { cart, openCart } = useCart();

<button onClick={openCart}>
  <CartIcon />
  {cart.totalItems > 0 && (
    <span>{cart.totalItems}</span>
  )}
</button>
```

## Data Structure

### CartItem
```typescript
type CartItem = {
  productId: string;
  name: string;
  priceInCents: number;
  imagePath?: string;
  quantity: number;
  slug: string;
};
```

### Cart
```typescript
type Cart = {
  items: CartItem[];
  totalItems: number;
  totalPriceInCents: number;
};
```

## LocalStorage

Cart data is automatically saved to localStorage under the key `'maks-cart'` and persists across:
- Page reloads
- Browser sessions
- Navigation

## Styling

The cart follows a minimalistic design inspired by Shopify:
- Clean white background
- Simple borders
- Hover effects on interactive elements
- Smooth transitions
- Mobile-responsive layout

## Next Steps

To complete the cart implementation, you may want to add:

1. **Checkout Flow**
   - Create checkout page
   - Integrate payment processing
   - Handle order creation

2. **Product Variants**
   - Size/color selection
   - SKU management
   - Inventory tracking

3. **Cart Persistence**
   - Sync with user accounts
   - Recover abandoned carts
   - Cross-device sync

4. **Enhanced Features**
   - Promo codes
   - Shipping calculation
   - Tax calculation
   - Wishlist integration
   - Recently viewed items

## Example Implementation

See the updated product page at:
`src/app/(customerFacing)/shop/[id]/page.tsx`

For product grid integration, add QuickAddButton to product cards in your shop listing.
