# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MAKS is a jewelry e-commerce platform built with Next.js 15 (App Router), React 19, TypeScript, and Prisma ORM. It features a customer-facing shop with Stripe checkout and an admin dashboard for product/order/content management.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Prettier formatting

# Database
npx prisma generate          # Generate Prisma client (also runs on npm install)
npx prisma migrate dev       # Run migrations
npm run db:seed              # Seed database

# Stripe (separate terminal during development)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

No test framework is configured.

## Architecture

### Route Groups
- `src/app/(customerFacing)/` — Customer pages (shop, checkout, gallery, about). Has its own layout with Nav, Cart, and Footer.
- `src/app/admin/` — Admin dashboard (products, orders, customers, CMS). Separate layout with NavAdmin.
- `src/app/api/` — REST API routes for products, orders, checkout, webhooks, uploads, collections, hero content.

### Data Layer
- **Prisma ORM** with PostgreSQL via Prisma Accelerate (connection pooling).
- Schema at `prisma/schema.prisma`. Prisma client singleton in `src/lib/prisma.ts`.
- Business logic queries live in `src/lib/` (products.ts, orders.ts, collections.ts, customers.ts, hero.ts, dashboard.ts).
- Utility/formatting helpers in `src/lib/utils/`.

### State Management
- **CartContext** (`src/contexts/CartContext.tsx`) — Client-side cart with localStorage persistence (key: `maks-cart`).
- **NavContext** (`src/contexts/NavContext.tsx`) — Navigation state.

### Payment Flow
1. Client calls `POST /api/checkout/create-session` with cart items and customer info.
2. Stripe hosted checkout page handles payment.
3. `POST /api/webhooks/stripe` processes `checkout.session.completed` — creates/finds user, addresses, order, payment, and marks products as ORDERED.

### Image Handling
- Product images uploaded to **Cloudinary** via `/api/upload` routes.
- Next.js Image optimization configured for `images.unsplash.com` and `res.cloudinary.com`.

### UI
- **shadcn/ui** components in `src/components/ui/` with Radix UI primitives.
- **Tailwind CSS v4** for styling, mobile-first approach.
- **Framer Motion** for animations.
- Font: Inter via Google Fonts.

### Key Conventions
- Path alias: `@/*` maps to `./src/*`.
- Dual currency pricing: PLN (grosz) and EUR (cents) stored as integers.
- Product IDs are manual strings (not UUIDs); most other models use UUIDs.
- Products have statuses: SHOP (available) → ORDERED (sold via checkout) → SOLD.
- Categories enum: NECKLACES, RINGS, EARRINGS.

## Environment Variables

Required: `DATABASE_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
