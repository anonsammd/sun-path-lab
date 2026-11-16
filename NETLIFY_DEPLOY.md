# Netlify Production Deployment Guide — Sun Path Lab

This comprehensive guide explains how to deploy the **Sun Path Lab** website and Owner CMS to **Netlify** with zero downtime, full SSR functionality, and live Neon PostgreSQL connectivity.

---

## 1. Quick Overview

- **Project:** Sun Path Lab (Pathology Laboratory & Owner CMS)
- **Framework:** Astro 5 SSR (`@astrojs/netlify`)
- **Node Version:** Node.js 20 or 22
- **Database:** Neon PostgreSQL (HTTP serverless driver)
- **Archives Provided:**
  - `sunpathlab-source.zip` (3.64 MB): Clean full source code ready for GitHub or Netlify Git import.
  - `sunpathlab-dist.zip` (1.71 MB): Pre-built publish assets (`dist`).

---

## 2. Deployment Methods

### Method A: Git Integration (Recommended for SSR & Continuous Updates)

This is the standard and most reliable method for Astro SSR on Netlify. Whenever you push code to GitHub, Netlify automatically builds and deploys both static assets and serverless functions.

1. **Extract `sunpathlab-source.zip`** or push the workspace to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: complete production ready Sun Path Lab website and CMS"
   git remote add origin https://github.com/<your-username>/sunpathlab.git
   git push -u origin main
   ```
2. Log into **[Netlify Dashboard](https://app.netlify.com/)**.
3. Click **"Add new site"** &rarr; **"Import an existing project"**.
4. Select **GitHub** and pick the `sunpathlab` repository.
5. Netlify will auto-detect settings from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `.netlify/v1/functions`
6. Click **"Add Environment Variables"** (see Section 3 below).
7. Click **"Deploy site"**.

---

### Method B: Netlify CLI Deployment (Direct from Local Terminal)

If you have the Netlify CLI installed, you can deploy in one command without Git:

```bash
# 1. Install Netlify CLI globally (if not already installed)
npm install -g netlify-cli

# 2. Login to Netlify
netlify login

# 3. Link or create a new site
netlify init

# 4. Set environment variables on Netlify
netlify env:set DATABASE_POOL "postgresql://neondb_owner:npg_1wA2xJocgqFp@ep-calm-sun-a1pvep6z-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
netlify env:set DIRECT_DATABASE_URL "postgresql://neondb_owner:npg_1wA2xJocgqFp@ep-calm-sun-a1pvep6z.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
netlify env:set SESSION_SECRET "e5f2a1b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1"
netlify env:set SITE_URL "https://your-site-name.netlify.app"

# 5. Build and deploy to production
npm run build
netlify deploy --prod
```

---

### Method C: Netlify Drag & Drop (`sunpathlab-dist.zip`)

For manual static preview without a command line:
1. Open **[Netlify Drop](https://app.netlify.com/drop)** in your browser.
2. Drag and drop `sunpathlab-dist.zip` (or extract and drag the `dist` folder).
3. *Note on Drag & Drop:* Netlify web drop serves client assets and prerendered pages. For dynamic database CRUD and owner login, you must add the Environment Variables in **Site Configuration &rarr; Environment variables** and trigger a rebuild or use Method A / B.

---

## 3. Required Environment Variables

Configure these variables in **Netlify Dashboard &rarr; Site configuration &rarr; Environment variables**:

| Variable Name | Description | Example / Verified Value |
|---|---|---|
| `DATABASE_POOL` | Neon connection string with connection pooler | `postgresql://neondb_owner:npg_1wA2xJocgqFp@ep-calm-sun-a1pvep6z-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` |
| `DIRECT_DATABASE_URL` | Neon direct connection string (for migrations) | `postgresql://neondb_owner:npg_1wA2xJocgqFp@ep-calm-sun-a1pvep6z.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` |
| `SESSION_SECRET` | 32+ character random secret for signing session cookies | `e5f2a1b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1` |
| `SITE_URL` | Your public production URL | `https://sunpathlab.com` (or your Netlify subdomain) |
| `NODE_VERSION` | Node.js runtime version | `20` |

### Optional Image Storage (Cloudinary)
If you wish to enable custom direct image uploads in the CMS media library:

| Variable Name | Description | Example |
|---|---|---|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `your-api-secret` |

*(If Cloudinary credentials are not set, the CMS gracefully falls back to local and external image URLs).*

---

## 4. Default Owner / Admin Credentials

Once deployed, access the private owner portal at `/admin/login`:

- **Login URL:** `https://your-site.netlify.app/admin/login`
- **Email:** `owner@sunpathlab.com`
- **Password:** `SunPathLab@2026!`
- **Role:** Super Admin / Laboratory Owner

*(You can change the email and password or create additional staff accounts anytime via `npx tsx scripts/create-admin.ts` or directly in the database).*

---

## 5. Live Zero-Redeployment Package Updates

When the owner creates, edits, or deletes a diagnostic package in `/admin/packages`:
- Changes are written directly to **Neon PostgreSQL**.
- The public website (`/` and `/packages`) queries the database on each request.
- **No Git commits or Netlify redeployments are required.** Changes are visible instantly to patients across Jabalpur.

---

## 6. Pre-flight Verification Checklist

- [x] **Database connection:** Verified live on Neon PostgreSQL with SSL mode required.
- [x] **Migrations applied:** Drizzle migration `0000_conscious_eternity.sql` executed.
- [x] **Seed data loaded:** 4 diagnostic categories, 5 verified diagnostic packages, site settings, and media assets.
- [x] **Argon2id Auth:** Secure server-side authentication with rate limiting and CSRF protection.
- [x] **UI Responsiveness:**
  - Header logo uses `object-contain` in a clean container (no cropping).
  - Header navigation collapses smoothly to an accessible mobile drawer below `1280px` (`xl:hidden`).
  - Mobile quick contacts use a non-obtrusive bottom sticky bar (`md:hidden`) with full-width WhatsApp and Call buttons (no text collision).
  - Desktop floating contact pills positioned neatly at bottom-right (`hidden md:flex`).
  - Hero card "Open till 10 PM" badge uses `whitespace-nowrap flex-shrink-0` to avoid badge text wrapping.
  - Admin dashboard includes a dedicated horizontal scroll navigation bar on mobile/tablet viewports.
- [x] **Production build:** `npm run build` completed with 0 errors and 0 warnings.
