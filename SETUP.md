# Sun Path Lab — Setup, Local Development & Netlify Deployment Guide

This document contains everything needed to run, manage, test, and deploy the **Sun Path Lab** website and owner management system.

---

## 1. Verified Business Details (Source of Truth)

- **Name:** Sun Path Lab (सुन पथ लैब)
- **Category:** Pathology & Diagnostic Laboratory
- **Location:** Shop No. 2, Sidhhi Vinayak Plaza, in front of Jabalpur Hospital Old Gate, Russell Chowk, Jabalpur, Madhya Pradesh – 482001
- **Landmark:** Opposite Jabalpur Hospital Old Gate, Russell Chowk
- **Google Plus Code:** `5W6P+XC, Jabalpur, Madhya Pradesh`
- **Phone:** `+91 9300755303`, `7000719306`
- **Landline:** `0761-3562885`
- **WhatsApp:** `+91 9300755303` (`https://wa.me/919300755303`)
- **Hours:** Open daily until 10:00 PM (Configurable in Admin Dashboard)
- **Quality Certification:** ISO 9001:2015 Certified
- **Verified Review Rating:** 4.9 / 5 from 77 Google reviews

---

## 2. Technology Stack

- **Framework:** Astro 5 (Server-Rendered / SSR)
- **Styling:** Tailwind CSS (Atkinson Hyperlegible Accessible Healthcare Palette)
- **Language:** TypeScript
- **Database:** Neon Serverless PostgreSQL (`@neondatabase/serverless` HTTP driver)
- **ORM & Migrations:** Drizzle ORM + Drizzle Kit
- **Authentication:** Custom server-side Argon2id password hashing + secure HTTP-only cookies
- **Image Management:** Cloudinary (Server-side signed uploads)
- **Hosting / SSR Adapter:** Netlify (`@astrojs/netlify`)

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env` or verify the existing `.env` file in the project root:

```env
# Neon PostgreSQL Connection URLs
DATABASE_POOL="postgresql://neondb_owner:***@ep-xyz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_DATABASE_URL="postgresql://neondb_owner:***@ep-xyz.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Custom Session Encryption Secret (32+ chars random string)
SESSION_SECRET="your_secure_random_session_secret"

# Cloudinary Media Management
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_SECRET_KEY="your_api_secret"
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"

# Public Site URL
SITE_URL="https://sunpathlab.com"
```

---

## 4. Initial Owner CMS Account Credentials

An initial owner administrator account has been bootstrapped in PostgreSQL:

- **Login URL:** `/admin/login` (Local: `http://localhost:4321/admin/login`)
- **Owner Email:** `owner@sunpathlab.com`
- **Master Password:** `SunPathLab@2026!`
- **Role:** `owner`

To create additional administrators or reset credentials, run the interactive CLI command:
```bash
npm run admin:create
```

---

## 5. Local Development Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Database Migrations (Applies schema to Neon PostgreSQL)
```bash
npm run db:migrate
```

### 3. Seed Database with Verified Packages & Initial Data
```bash
npm run db:seed
```

### 4. Start Local Development Server
```bash
npm run dev
```
Open **`http://localhost:4321`** in your browser to view the site, or **`http://localhost:4321/admin`** to log into the owner dashboard.

### 5. Run Production Build & Typecheck
```bash
npm run build
```

---

## 6. How the Owner CMS Works

1. **Zero Redeployment Updates:**
   - Any package created, updated, or deleted in the admin dashboard (`/admin/packages`) is saved in Neon PostgreSQL.
   - The public website (`/`, `/packages`, `/packages/[slug]`) queries the database on request, so changes are **instantaneous** without triggering a Netlify rebuild or GitHub commit.
2. **Site Settings CMS:**
   - Go to `/admin/settings` to edit the phone numbers, announcement banner, hero headline, about description, and operating hours.
3. **Cloudinary Media Manager:**
   - Go to `/admin/media` to upload new lab images. The upload is signed server-side using Cloudinary credentials, and registered in the database.
4. **Data Backup & Export:**
   - Go to `/admin/export` to download a complete JSON snapshot or CSV spreadsheet of all packages and settings.

---

## 7. Netlify Deployment Guide (Free Plan)

Because Sun Path Lab is an Astro SSR application with live PostgreSQL database queries and custom server-side authentication, it uses Netlify Functions for server routes.

### Method A: Connect GitHub Repository (Recommended — 100% Automated)
1. Push your code to a private or public GitHub repository.
2. Log in to [Netlify](https://app.netlify.com).
3. Click **Add new site** → **Import an existing project** → **GitHub**.
4. Select the `sunpathlab` repository.
5. Netlify will auto-detect settings from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. In **Environment variables**, add:
   - `DATABASE_POOL`: Your Neon pooled connection string
   - `DIRECT_DATABASE_URL`: Your Neon direct connection string
   - `SESSION_SECRET`: Your session secret
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_SECRET_KEY`: Your Cloudinary API secret
   - `SITE_URL`: `https://sunpathlab.com` (or your Netlify subdomain)
7. Click **Deploy Site**.

### Method B: Netlify CLI Direct Deployment
If you prefer deploying from your terminal without connecting Git:
```bash
# 1. Install Netlify CLI if not already installed
npm install -g netlify-cli

# 2. Build the production project
npm run build

# 3. Deploy to production
netlify deploy --prod
```

### Method C: Drag & Drop Zip
A deployment package `sunpathlab-deploy.zip` and repository source zip `sunpathlab-source.zip` are included in the workspace root.
- In Netlify, navigate to **Sites** → drag and drop the `dist/` folder or upload the zip.
- Ensure your environment variables are configured in Netlify Site Settings → Environment Variables.

---

## 8. Database Backup & Disaster Recovery

- **Application Exports:** Available anytime from `/admin/export` in JSON or CSV.
- **Neon Cloud Backups:** Neon automatically retains continuous write-ahead log (WAL) history and point-in-time restore for your PostgreSQL database on the free tier.
