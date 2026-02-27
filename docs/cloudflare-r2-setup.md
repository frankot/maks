# Cloudflare R2 Setup Guide

Step-by-step instructions for creating an R2 bucket and obtaining credentials for the MAKS project.

---

## Prerequisites

- A Cloudflare account (free tier works). Sign up at https://dash.cloudflare.com/sign-up

---

## Step 1: Create an R2 Bucket

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com)
2. In the left sidebar, click **R2 Object Storage**
3. If prompted, enable R2 (it requires a valid payment method on file, but the free tier is 10GB/month at no cost)
4. Click **Create bucket**
5. Enter bucket name: `maks-images`
6. Leave **Location** as default (automatic)
7. Click **Create bucket**

---

## Step 2: Enable Public Access on the Bucket

By default R2 buckets are private. You need to enable public access to get the `r2.dev` URL.

1. Open the `maks-images` bucket you just created
2. Click the **Settings** tab
3. Scroll to **Public access**
4. Under **R2.dev subdomain**, click **Allow Access**
5. Confirm the warning — this makes all objects in the bucket publicly readable
6. Cloudflare will show you the public URL: `https://pub-XXXXXXXXXXXXXXXXXXXXXXXXXXXX.r2.dev`

   **Copy this URL** — it goes into `R2_PUBLIC_URL` in your `.env`

---

## Step 3: Get Your Account ID

1. In the Cloudflare Dashboard, click on your account name in the top-left
2. Go to **Overview** (or any page in the dashboard)
3. In the right sidebar under **API**, you'll see **Account ID**

   **Copy this value** — it goes into `R2_ACCOUNT_ID` in your `.env`

---

## Step 4: Create R2 API Credentials (Access Key)

R2 uses S3-compatible credentials — an Access Key ID and Secret Access Key.

1. In the Cloudflare Dashboard, go to **R2 Object Storage**
2. Click **Manage R2 API Tokens** (top right, or under API section)
3. Click **Create API Token**
4. Configure the token:
   - **Token name**: `maks-r2-token` (or any name)
   - **Permissions**: Select **Object Read & Write**
   - **Specify bucket**: Select `maks-images` (restrict to just this bucket)
   - **TTL**: Leave as default (no expiry) or set a long expiry
5. Click **Create API Token**
6. Cloudflare will show the credentials **once only** — copy them immediately:
   - **Access Key ID** → goes into `R2_ACCESS_KEY_ID`
   - **Secret Access Key** → goes into `R2_SECRET_ACCESS_KEY`

   > If you lose the Secret Access Key, you must create a new token.

---

## Step 5: Set Environment Variables

Add these to your `.env` file (never commit `.env` to git):

```env
# Cloudflare R2
R2_ACCOUNT_ID=your_account_id_from_step_3
R2_ACCESS_KEY_ID=your_access_key_id_from_step_4
R2_SECRET_ACCESS_KEY=your_secret_access_key_from_step_4
R2_BUCKET_NAME=maks-images
R2_PUBLIC_URL=https://pub-XXXXXXXXXXXXXXXXXXXXXXXXXXXX.r2.dev
```

For **production** (Vercel):

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add each of the 5 variables above
3. Set them for **Production** (and optionally **Preview**)
4. Redeploy the project after adding

---

## Step 6: Verify CORS (if needed)

If you ever see CORS errors when loading images in the browser, add a CORS policy to the bucket:

1. Open `maks-images` → **Settings** tab
2. Scroll to **CORS Policy**
3. Click **Add CORS policy** and paste:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

4. Click **Save**

> For a production site you can restrict `AllowedOrigins` to your domain (e.g. `https://yourdomain.com`).

---

## Free Tier Limits (as of 2025)

| Resource                       | Free allowance       |
| ------------------------------ | -------------------- |
| Storage                        | 10 GB / month        |
| Class A operations (PUT, POST) | 1,000,000 / month    |
| Class B operations (GET)       | 10,000,000 / month   |
| Egress via Cloudflare CDN      | **Free** (unlimited) |

For a small jewelry e-commerce site this is more than sufficient.

---

## Summary of Values Needed

| `.env` key             | Where to find it                                         |
| ---------------------- | -------------------------------------------------------- |
| `R2_ACCOUNT_ID`        | Dashboard → right sidebar → Account ID                   |
| `R2_ACCESS_KEY_ID`     | R2 → Manage R2 API Tokens → token Access Key ID          |
| `R2_SECRET_ACCESS_KEY` | R2 → Manage R2 API Tokens → token Secret Access Key      |
| `R2_BUCKET_NAME`       | `maks-images` (the bucket name you chose in Step 1)      |
| `R2_PUBLIC_URL`        | Bucket → Settings → Public access → R2.dev subdomain URL |
