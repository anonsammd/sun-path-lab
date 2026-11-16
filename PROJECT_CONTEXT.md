# Project Context: Sun Path Lab

## 1. Verified Business Information
Source of Truth: `details.md` (Consolidated from Google Business Profile & verified listing records)

- **Official Name:** Sun Path Lab (सुन पथ लैब)
- **Business Type:** Medical laboratory / Pathology and diagnostic testing centre
- **Location:** Jabalpur, Madhya Pradesh, India
- **Address:** Shop No. 2, Sidhhi Vinayak Plaza, in front of Jabalpur Hospital Old Gate, Russell Chowk, Jabalpur, MP - 482001
- **Landmark:** Opposite Jabalpur Hospital Old Gate, Russell Chowk
- **Google Plus Code:** 5W6P+XC, Jabalpur, Madhya Pradesh
- **Phone Numbers:**
  - Primary Mobile / Click-to-call: `+91 9300755303` (`9300755303`)
  - Secondary Mobile: `7000719306`
  - Landline: `0761-3562885`
- **WhatsApp:** `+91 9300755303` (International format: `https://wa.me/919300755303`)
- **Website URL:** `https://sunpathlab.com`
- **Operating Hours:** Closes at 10:00 PM (Daily schedule subject to owner confirmation via CMS settings)
- **Verified Reputation Snapshot:** 4.9 / 5 rating from 77 Google reviews
- **Verified Core Services:**
  1. Blood Sample Collection (in-lab and home collection)
  2. Home Sample Collection (convenient, punctual, careful sample handling)
  3. Routine & Preventive Health Panels / Full Body Checkup options
  4. Thyroid Testing (TSH, T3, T4 profiles)
  5. Iron-level Testing & Deficiency Panels
  6. Pathology and diagnostic testing with accurate, timely reporting
- **Quality & Certification:** ISO 9001:2015 certified laboratory (`ISO9001-2015.webp` verified asset present in workspace).
- **Facilities & Imagery:**
  - Authentic reception photo (`reception.webp`)
  - Authentic lab interior photo (`lab_image.webp`)
  - Exterior/entrance photo (`WhatsApp Image 2026-11-16 at 3.13.47 PM.jpeg` -> `exterior.jpg`)
  - Official ISO 9001:2015 mark (`ISO9001-2015.webp`)

---

## 2. Technical Stack & Implementation Decisions

| Layer | Selected Tech | Justification / Rules |
|---|---|---|
| **Framework** | Astro 5 | Content-driven, partial hydration, SSR for dynamic packages & CMS, zero unnecessary client JS |
| **Styling** | Tailwind CSS | Utility-first, medical color tokens, responsive mobile-first |
| **Language** | TypeScript | Full type safety across DB schemas, API requests, and UI props |
| **Database** | Neon PostgreSQL | Serverless Postgres via `@neondatabase/serverless` HTTP driver |
| **ORM** | Drizzle ORM + Drizzle Kit | Lightweight, zero-overhead SQL-like ORM, type-safe schema & migrations |
| **Authentication** | Custom Server-Side Auth | Argon2id (`@node-rs/argon2`) + HTTP-only secure cookie session + server-side session table |
| **Image Management** | Cloudinary | Server-side signed uploads, asset storage, responsive transformations |
| **Deployment Target** | Netlify | `@astrojs/netlify` SSR adapter, Netlify Edge / Serverless functions |
| **Icons** | Lucide Icons (`lucide-astro`) | Clean clinical SVG icons, no emojis as UI icons |

---

## 3. Architecture & Security Rules

1. **Strict No-Fabrication Policy:**
   - No fake doctor profiles or unverified clinical claims.
   - All diagnostic packages stored in PostgreSQL; initial seeds only include verified categories and panels with transparent "Contact for latest quote / customized panel" or verified pricing.
   - Prices and package inclusions can be added, updated, or removed in real time via the Admin Dashboard.
2. **Dynamic Live Content (Zero Redeployment Needed):**
   - Package catalog, individual package pages, homepage featured packages, and general business settings (hours, phone, announcements) are rendered from PostgreSQL.
   - Updates made in `/admin` take effect immediately on public pages.
3. **Defense-in-Depth Security:**
   - Password hashing: Argon2id with random salt.
   - Sessions: Cryptographically secure random tokens stored in `sessions` table with expiration, checked on every admin route and API request.
   - Cookies: `HttpOnly`, `SameSite=Lax` (or `Strict`), `Secure` in production, `Path=/`.
   - Rate limiting: In-memory sliding window on login attempts (`5 attempts per 15 minutes` per IP).
   - CSRF protection: Custom CSRF token validation on sensitive state-changing POST/PUT/DELETE requests.
   - Input validation: Type checking, slugification sanitization, length limits.
4. **Owner Bootstrap:**
   - One-time secure CLI script (`npm run admin:create` via `tsx scripts/create-admin.ts`).
   - No public admin registration or unauthenticated endpoints.
