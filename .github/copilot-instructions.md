# Copilot Instructions for AI Coding Agents

## Project Overview
- This is a Next.js monorepo with a clear separation between customer-facing and admin interfaces under `src/app/(customerFacing)` and `src/app/admin`.
- Data access and business logic are handled via Prisma ORM, with schema and migrations in `prisma/` and API routes in `src/app/api/`.
- UI components are organized in `src/components/ui/` and feature reusable patterns for forms, dialogs, tables, and navigation.

## Key Workflows
- **Development:** Start with `npm run dev` (see `README.md`).
- **Database:** Prisma migrations are managed in `prisma/migrations/`. Use `prisma/seed.ts` for seeding.
- **API:** All backend logic is in `src/app/api/`, with RESTful routes for products, orders, customers, uploads, and hero content.
- **Admin vs. Customer:** Admin features (dashboard, CRUD, stats) are in `src/app/admin/`; customer-facing features (product display, hero, featured products) are in `src/app/(customerFacing)`.

## Patterns & Conventions
- **File Naming:** Use PascalCase for React components, camelCase for utility files, and kebab-case for folders.
- **Component Structure:** UI components are stateless and reusable; business logic is separated into `src/lib/`.
- **API Routes:** Each resource (e.g., products, orders) has its own folder and route handler in `src/app/api/`.
- **Prisma Usage:** All DB access goes through `src/lib/prisma.ts` and typed models from `prisma/schema.prisma`.
- **Feature Flags:** Product features like `is_featured` and dual currency support are managed via schema fields and migrations.

## Integration Points
- **External:** Uses Prisma ORM, Next.js, and PostCSS. No custom build/test scripts beyond Next.js defaults.
- **Images/Assets:** Static assets are in `public/` and referenced in UI components.
- **Admin/Customer Communication:** No direct cross-boundary calls; all communication is via API routes.

## Examples
- To add a new product API: create a folder in `src/app/api/products/`, add a `[id]/route.ts` for dynamic routes, and update `src/lib/products.ts` for business logic.
- To add a new UI component: place it in `src/components/ui/`, use stateless props, and import where needed.
- To update DB schema: edit `prisma/schema.prisma`, run `npx prisma migrate dev`, and update models in `src/lib/`.

## References
- See `README.md` for dev server instructions.
- See `prisma/schema.prisma` and `prisma/migrations/` for DB structure.
- See `src/app/api/` for backend routes and logic.
- See `src/components/ui/` for UI patterns.

---
If any section is unclear or missing, please provide feedback to improve these instructions.
