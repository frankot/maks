This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL database connection string
- `STRIPE_SECRET_KEY` - Stripe secret key (test mode)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (test mode)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `NEXT_PUBLIC_APP_URL` - Application URL (http://localhost:3000 for development)
- Cloudinary credentials for image uploads

### 3. Set Up Stripe

This project uses Stripe for payment processing. Follow the detailed setup guide:

**📖 [Read the complete Stripe setup guide](./STRIPE_SETUP.md)**

Quick start:
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your test API keys from the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
3. Install and authenticate the Stripe CLI
4. Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` to get your webhook secret
5. Add all Stripe keys to `.env.local`

### 4. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed the database
npm run db:seed
```

### 5. Run the Development Server

```bash
npm run dev
```

### 6. Start Stripe Webhook Listener (in a separate terminal)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

### Payment Processing
- **Stripe Checkout Integration** - Secure hosted checkout pages
- **Automatic Order Creation** - Orders are created via webhooks after successful payment
- **Payment Status Tracking** - Real-time payment status updates
- **Test Mode** - Safe testing with Stripe test cards

### E-commerce
- Shopping cart functionality
- Product catalog with categories and collections
- Dual currency support (PLN/EUR)
- Order management
- Guest checkout

### Admin Features
- CMS for content management
- Product management
- Order tracking
- Customer management

## Testing Payments

Use these test card numbers in Stripe Checkout:

| Card Number | Result |
|------------|--------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0000 0000 0002` | ❌ Card declined |
| `4000 0025 0000 3155` | 🔐 Requires authentication |

Use any future expiration date, any 3-digit CVC, and any ZIP code.

More test cards: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── (customerFacing)/    # Customer-facing pages
│   │   │   ├── checkout/         # Checkout flow with Stripe
│   │   │   └── shop/             # Product catalog
│   │   ├── admin/                # Admin dashboard
│   │   └── api/
│   │       ├── checkout/         # Stripe session creation
│   │       └── webhooks/         # Stripe webhook handlers
│   ├── components/               # Reusable UI components
│   ├── contexts/                 # React contexts (Cart, etc.)
│   └── lib/                      # Utilities and helpers
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Database migrations
└── STRIPE_SETUP.md              # Detailed Stripe setup guide
```

## API Routes

### Checkout
- `POST /api/checkout/create-session` - Create Stripe checkout session
- `POST /api/webhooks/stripe` - Handle Stripe webhook events

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order (legacy, replaced by webhook)
- `GET /api/orders/[id]` - Get order details

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product (admin)

## Environment Variables

See `.env.local.example` for all required environment variables.

**Important:** Never commit `.env.local` to version control!

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Stripe Documentation](https://stripe.com/docs) - Stripe API reference
- [Prisma Documentation](https://www.prisma.io/docs) - Database ORM

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Production Stripe Setup

Before deploying to production:
1. Switch to Live Mode in Stripe Dashboard
2. Get your live API keys
3. Create a webhook endpoint in Stripe Dashboard pointing to `https://yourdomain.com/api/webhooks/stripe`
4. Update all environment variables in your production environment

See [STRIPE_SETUP.md](./STRIPE_SETUP.md) for detailed production setup instructions.

