# Design: Cloudinary → Cloudflare R2 + Sharp

**Date:** 2026-02-25
**Status:** Approved

## Problem

Cloudinary free tier routes through US/Western EU nodes. Polish users experience slow image loads. Cloudflare has a data center in Warsaw (WAW), making R2 + Cloudflare CDN significantly faster for this audience.

## Decisions

- **CDN URL**: `r2.dev` public subdomain (domain is on Vercel DNS, not Cloudflare — custom domain not possible without nameserver change)
- **Existing images**: Keep Cloudinary URLs in DB unchanged. New uploads go to R2. Image loader and `next.config.ts` support both domains.
- **Folder structure**: Mirror current Cloudinary layout (`maks/products/`, `maks/gallery/`, `maks/hero/`)
- **Transformations**: Sharp handles resize + WebP conversion server-side on upload (Sharp already installed)

## Architecture

Single `src/lib/r2.ts` module exposes:

- `uploadToR2(buffer, key, mimeType)` → returns public URL
- `deleteFromR2(key)` → void

All upload routes import from `r2.ts`. No Cloudinary SDK anywhere in new code.

## Files Changed

| File                                  | Change                                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/lib/r2.ts`                       | **New** — R2 client, upload, delete helpers                                                 |
| `src/app/api/upload/route.ts`         | Replace Cloudinary with Sharp + R2                                                          |
| `src/app/api/upload/gallery/route.ts` | Same                                                                                        |
| `src/app/api/upload/hero/route.ts`    | Same                                                                                        |
| `src/app/api/gallery/rows/route.ts`   | Replace `cloudinary.uploader.destroy` with `deleteFromR2`                                   |
| `src/app/api/gallery/images/route.ts` | Same                                                                                        |
| `src/app/admin/products/actions.ts`   | Same                                                                                        |
| `src/lib/cloudinary-loader.ts`        | Replace with simple passthrough                                                             |
| `src/emails/OrderConfirmation.tsx`    | `getThumbnailUrl` returns src unchanged                                                     |
| `next.config.ts`                      | Add `*.r2.dev` remote pattern, keep `res.cloudinary.com` for old URLs, remove custom loader |
| `package.json`                        | Add `@aws-sdk/client-s3`, remove `cloudinary`, remove `next-cloudinary`                     |

## Image Processing Per Route

| Route                    | Max dimensions | Format | Quality                 |
| ------------------------ | -------------- | ------ | ----------------------- |
| `/api/upload` (products) | 2000×2000      | WebP   | 85, fallback 70 if >2MB |
| `/api/upload/gallery`    | 1200×1200      | WebP   | 85                      |
| `/api/upload/hero`       | 1920×1080      | WebP   | 85                      |

## New Environment Variables

```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=https://pub-<hash>.r2.dev
```

## Backward Compatibility

- `res.cloudinary.com` stays in `next.config.ts` `remotePatterns` — old product/gallery/hero images load normally
- `CLOUDINARY_*` env vars can be removed once all old images are naturally replaced over time
