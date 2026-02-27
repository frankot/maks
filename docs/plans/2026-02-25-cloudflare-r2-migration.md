# Cloudflare R2 Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Cloudinary with Cloudflare R2 + Sharp for all image uploads and deletes, serving via `r2.dev` CDN for faster load times in Poland.

**Architecture:** A single `src/lib/r2.ts` module wraps the S3-compatible R2 client (AWS SDK v3) and exposes `uploadToR2` and `deleteFromR2` helpers. Sharp (already installed) handles all image transformations server-side on upload. Existing Cloudinary URLs in the database remain valid — the loader and `next.config.ts` support both domains during transition.

**Tech Stack:** `@aws-sdk/client-s3` (S3-compatible R2 client), `sharp` (already installed), Cloudflare R2, Next.js App Router API routes.

**Note:** No test framework is configured in this project — skip all test steps.

---

### Task 1: Install and remove packages

**Files:**

- Modify: `package.json`

**Step 1: Install the S3 client**

```bash
npm install @aws-sdk/client-s3
```

**Step 2: Remove unused Cloudinary packages**

```bash
npm uninstall cloudinary next-cloudinary
```

**Step 3: Verify**

```bash
npm ls @aws-sdk/client-s3
```

Expected: `@aws-sdk/client-s3@x.x.x` listed with no errors.

---

### Task 2: Add environment variables

**Files:**

- Modify: `.env` (and `.env.example` if it exists)

**Step 1: Add R2 variables to `.env`**

```env
# Cloudflare R2
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_r2_access_key_id_here
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key_here
R2_BUCKET_NAME=maks-images
R2_PUBLIC_URL=https://pub-XXXXXXXXXXXX.r2.dev
```

> See `docs/cloudflare-r2-setup.md` for how to obtain these values from the Cloudflare dashboard.

**Step 2: Keep existing Cloudinary vars** — do NOT remove them yet. Old images in the DB still reference `res.cloudinary.com`.

---

### Task 3: Create the R2 client module

**Files:**

- Create: `src/lib/r2.ts`

**Step 1: Write `src/lib/r2.ts`**

```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

/**
 * Upload a buffer to R2 and return the public CDN URL.
 * @param buffer   - Pre-processed image buffer (already resized/converted by Sharp)
 * @param key      - Object key, e.g. "maks/products/abc123.webp"
 * @param mimeType - MIME type, e.g. "image/webp"
 */
export async function uploadToR2(buffer: Buffer, key: string, mimeType: string): Promise<string> {
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  )

  return `${process.env.R2_PUBLIC_URL}/${key}`
}

/**
 * Delete an object from R2 by its key.
 * @param key - Object key stored in the database as publicId, e.g. "maks/products/abc123.webp"
 */
export async function deleteFromR2(key: string): Promise<void> {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })
  )
}
```

**Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors related to `r2.ts`.

---

### Task 4: Replace the product upload route

**Files:**

- Modify: `src/app/api/upload/route.ts`

**Step 1: Rewrite `src/app/api/upload/route.ts`**

```typescript
import sharp from 'sharp'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { uploadToR2, deleteFromR2 } from '@/lib/r2'
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  MAX_IMAGE_DIMENSION,
  REUPLOAD_IMAGE_DIMENSION,
  IMAGE_QUALITY,
  REUPLOAD_IMAGE_QUALITY,
} from '@/lib/constants'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only image files are allowed.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.` },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const inputBuffer = Buffer.from(bytes)

    // Process with Sharp: resize + convert to WebP
    let processed = await sharp(inputBuffer)
      .resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: IMAGE_QUALITY })
      .toBuffer()

    // If result is >2MB, re-process with more aggressive compression
    const maxSizeBytes = 2 * 1024 * 1024
    let optimized = false
    if (processed.length > maxSizeBytes) {
      console.log(
        `Image too large (${(processed.length / 1024 / 1024).toFixed(2)}MB), re-optimizing...`
      )
      processed = await sharp(inputBuffer)
        .resize(REUPLOAD_IMAGE_DIMENSION, REUPLOAD_IMAGE_DIMENSION, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: REUPLOAD_IMAGE_QUALITY })
        .toBuffer()
      optimized = true
    }

    const key = `maks/products/${randomUUID()}.webp`
    const url = await uploadToR2(processed, key, 'image/webp')

    const meta = await sharp(processed).metadata()

    return NextResponse.json({
      publicId: key,
      url,
      width: meta.width ?? 0,
      height: meta.height ?? 0,
      format: 'webp',
      sizeInMB: (processed.length / 1024 / 1024).toFixed(2),
      optimized,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const { publicId } = await request.json()

    if (!publicId) {
      return NextResponse.json({ error: 'No public ID provided' }, { status: 400 })
    }

    // Support both old Cloudinary publicIds and new R2 keys
    if (!publicId.startsWith('maks/')) {
      // Old Cloudinary publicId — nothing to delete from R2
      return NextResponse.json({ success: true })
    }

    await deleteFromR2(publicId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
  }
}
```

---

### Task 5: Replace the gallery upload route

**Files:**

- Modify: `src/app/api/upload/gallery/route.ts`

**Step 1: Rewrite `src/app/api/upload/gallery/route.ts`**

```typescript
import sharp from 'sharp'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { uploadToR2, deleteFromR2 } from '@/lib/r2'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File size too large. Maximum size is 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
        },
        { status: 400 }
      )
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP files are allowed.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const inputBuffer = Buffer.from(bytes)

    const processed = await sharp(inputBuffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer()

    const meta = await sharp(processed).metadata()
    const key = `maks/gallery/${randomUUID()}.webp`
    const url = await uploadToR2(processed, key, 'image/webp')

    return NextResponse.json({
      publicId: key,
      url,
      width: meta.width ?? 0,
      height: meta.height ?? 0,
      format: 'webp',
    })
  } catch (error) {
    console.error('Gallery upload error:', error)
    return NextResponse.json({ error: 'Failed to upload gallery image' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const { publicId } = await request.json()

    if (!publicId) {
      return NextResponse.json({ error: 'No public ID provided' }, { status: 400 })
    }

    if (publicId.startsWith('maks/')) {
      await deleteFromR2(publicId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Gallery delete error:', error)
    return NextResponse.json({ error: 'Failed to delete gallery image' }, { status: 500 })
  }
}
```

---

### Task 6: Replace the hero upload route

**Files:**

- Modify: `src/app/api/upload/hero/route.ts`

**Step 1: Rewrite `src/app/api/upload/hero/route.ts`**

```typescript
import sharp from 'sharp'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { uploadToR2, deleteFromR2 } from '@/lib/r2'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const maxSize = 9 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File size too large. Maximum size is 9MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
        },
        { status: 400 }
      )
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP files are allowed.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const inputBuffer = Buffer.from(bytes)

    const processed = await sharp(inputBuffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer()

    const meta = await sharp(processed).metadata()
    const key = `maks/hero/${randomUUID()}.webp`
    const url = await uploadToR2(processed, key, 'image/webp')

    return NextResponse.json({
      publicId: key,
      url,
      width: meta.width ?? 0,
      height: meta.height ?? 0,
      format: 'webp',
    })
  } catch (error) {
    console.error('Hero upload error:', error)
    return NextResponse.json({ error: 'Failed to upload hero image' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const { publicId } = await request.json()

    if (!publicId) {
      return NextResponse.json({ error: 'No public ID provided' }, { status: 400 })
    }

    if (publicId.startsWith('maks/')) {
      await deleteFromR2(publicId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Hero delete error:', error)
    return NextResponse.json({ error: 'Failed to delete hero image' }, { status: 500 })
  }
}
```

---

### Task 7: Update gallery rows and images delete routes

**Files:**

- Modify: `src/app/api/gallery/rows/route.ts`
- Modify: `src/app/api/gallery/images/route.ts`

**Step 1: Update `gallery/rows/route.ts` — remove Cloudinary, use `deleteFromR2`**

Replace the top of the file:

```typescript
// REMOVE these lines:
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({ ... });

// ADD:
import { deleteFromR2 } from '@/lib/r2';
```

Replace the delete loop in the `DELETE` handler:

```typescript
// REMOVE:
await cloudinary.uploader.destroy(image.publicId)

// REPLACE WITH:
if (image.publicId.startsWith('maks/')) {
  await deleteFromR2(image.publicId)
}
```

**Step 2: Update `gallery/images/route.ts` — remove Cloudinary, use `deleteFromR2`**

Replace the top of the file:

```typescript
// REMOVE these lines:
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({ ... });

// ADD:
import { deleteFromR2 } from '@/lib/r2';
```

Replace the cleanup block in the `DELETE` handler:

```typescript
// REMOVE:
await cloudinary.uploader.destroy(image.publicId)

// REPLACE WITH:
if (image.publicId.startsWith('maks/')) {
  await deleteFromR2(image.publicId)
}
```

---

### Task 8: Update product delete action

**Files:**

- Modify: `src/app/admin/products/actions.ts`

**Step 1: Replace Cloudinary import and delete calls**

At the top, remove:

```typescript
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({ ... });
```

Add:

```typescript
import { deleteFromR2 } from '@/lib/r2'
```

Replace the delete loop:

```typescript
// REMOVE:
await cloudinary.uploader.destroy(publicId)

// REPLACE WITH:
if (publicId.startsWith('maks/')) {
  await deleteFromR2(publicId)
}
```

---

### Task 9: Update the image loader

**Files:**

- Modify: `src/lib/cloudinary-loader.ts`

**Step 1: Replace with a passthrough loader**

All images are now pre-optimised WebP on upload (correct size, format, quality). The Next.js custom loader just needs to return the URL as-is.

```typescript
import type { ImageLoaderProps } from 'next/image'

/**
 * Passthrough image loader.
 * Images are pre-optimised on upload via Sharp (WebP, resized, quality set).
 * Old Cloudinary URLs continue to work as-is.
 */
export default function imageLoader({ src }: ImageLoaderProps): string {
  return src
}
```

---

### Task 10: Update next.config.ts

**Files:**

- Modify: `next.config.ts`

**Step 1: Add `r2.dev` remote pattern, keep Cloudinary for backward compat**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma'],
  images: {
    loader: 'custom',
    loaderFile: './src/lib/cloudinary-loader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
```

---

### Task 11: Update email thumbnail helper

**Files:**

- Modify: `src/emails/OrderConfirmation.tsx`

**Step 1: Update `getThumbnailUrl`**

The function currently adds Cloudinary URL transform params for thumbnails. Since R2 images are pre-sized and old Cloudinary images still load as-is, simplify to a passthrough:

```typescript
function getThumbnailUrl(imagePath: string): string {
  return imagePath
}
```

---

### Task 12: Write the Cloudflare dashboard setup guide

**Files:**

- Create: `docs/cloudflare-r2-setup.md`

**Step 1: Write `docs/cloudflare-r2-setup.md`**

See full content below in the guide section. This file is the human-readable setup instructions referenced by Task 2.

---

### Task 13: Verify the build

**Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors.

**Step 2: Run linter**

```bash
npm run lint
```

Expected: No errors.

**Step 3: Start dev server and manually test an upload**

```bash
npm run dev
```

- Go to `/admin/products` → create a product → upload an image
- Confirm the returned URL starts with `https://pub-*.r2.dev/maks/products/`
- Confirm the image loads in the product list
- Go to `/admin/cms` → Hero tab → upload a hero image
- Confirm it saves and displays

---

## Cloudflare R2 Setup Guide (for Task 12)

The full content of `docs/cloudflare-r2-setup.md` is in that file once Task 12 is complete.
