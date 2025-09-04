# Deploying a temporary, reliable staging site

This project is a Next.js App Router app with Prisma (Postgres), Stripe (optional), and Resend (optional). Below are two reliable ways to put it on the internet quickly.

## Option A — Fastest (no external DB, no real payments)
Use Vercel with the built-in preview domain and fake payments.

- What you get: a stable `*.vercel.app` URL for testing checkout flow without real card processing.
- Good for: demos and UI/UX validation.

Steps
1) Push this repo to GitHub, GitLab, or Bitbucket.
2) Import the repo in Vercel → New Project.
3) In Vercel → Project Settings → Environment Variables, set:
   - NEXT_PUBLIC_BASE_URL = https://<your-project>.vercel.app
   - PAYMENTS_PROVIDER = fake
   - NEXT_PUBLIC_PAYMENTS_PROVIDER = fake
   - (Optional emails) RESEND_API_KEY, BOOKINGS_FROM_EMAIL
4) Build & deploy. The `postinstall` hook generates the Prisma client automatically.
5) Seed optional sample data (locally) and create bookings normally. The fake processor validates card numbers with Luhn and marks bookings as paid.

Notes
- No real Postgres is needed in this mode because the app won’t read/write without a DB. If you want actual data persistence in staging, use Option B.

## Option B — Real Postgres + optional Stripe + emails (recommended staging)
Use Vercel + Neon (or Supabase) for Postgres. You’ll get a durable database and keep free/cheap tiers.

Steps
1) Create a Postgres database
   - Neon: create a project → copy the connection string ("postgres://user:pass@host/db")
2) In Vercel → Project Settings → Environment Variables, set:
   - DATABASE_URL = <your Neon connection string>
   - NEXT_PUBLIC_BASE_URL = https://<your-project>.vercel.app
   - PAYMENTS_PROVIDER = stripe or fake (your choice)
   - NEXT_PUBLIC_PAYMENTS_PROVIDER = stripe or fake (match above)
   - If Stripe: STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   - If Stripe Webhooks in prod: STRIPE_WEBHOOK_SECRET (from Stripe → Developers → Webhooks)
   - If using emails: RESEND_API_KEY, BOOKINGS_FROM_EMAIL
3) Run DB migrations on Vercel
   - In Project → Settings → Build & Development Settings → Add a Post-deploy Command:
     npx prisma migrate deploy
   - Or run once using a Vercel CLI one-off: `vercel env pull` + `npx prisma migrate deploy` from a temporary shell.
4) Deploy.
5) (Optional) Seed sample data
   - Safer to run locally against the same DATABASE_URL:
     - Temporarily set DATABASE_URL locally to the Neon URL
     - Run: `npx prisma generate && npx prisma migrate deploy && npx tsx prisma/seed.ts`

### Neon connection tips (Prisma)
- Prefer the “Direct” connection string (host does NOT include `-pooler`) for migrations; ensure `sslmode=require`.
- If you keep using the pooler (PgBouncer in transaction mode), append `pgbouncer=true` and keep `sslmode=require`:
   - Example: `postgresql://USER:PASSWORD@POOLER_HOST:5432/DB?sslmode=require&schema=public&pgbouncer=true`
- For best of both worlds, set runtime to pooler and migrations to direct using a shadow DB URL:

Add to `.env` (values from Neon → “Direct”):
```
SHADOW_DATABASE_URL="postgresql://USER:PASSWORD@DIRECT_HOST:5432/DB?sslmode=require&schema=public"
```

Then in `prisma/schema.prisma`:
```
datasource db {
   provider          = "postgresql"
   url               = env("DATABASE_URL")
   shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}
```
This prevents Prisma Migrate from hanging behind PgBouncer transaction pooling.

## Stripe webhook (only if using Stripe)
- In production: Stripe → Developers → Webhooks → Add endpoint: https://<your-project>.vercel.app/api/stripe/webhook
- Copy the signing secret to STRIPE_WEBHOOK_SECRET in Vercel env vars and redeploy.

## Custom domain on Namecheap (optional but recommended)
You can keep the default `*.vercel.app` URL, or add your own domain/subdomain from Namecheap.

1) Add the domain in Vercel
- Vercel Project → Settings → Domains → Add. Enter either:
   - A subdomain like `staging.example.com`, or
   - Your apex/root, e.g., `example.com` (plus add `www`).

2) Configure DNS in Namecheap
- Namecheap → Domain List → Manage → Advanced DNS.
- For a subdomain (easiest):
   - Add a CNAME record: Host = the subdomain (e.g., `staging`), Value = `cname.vercel-dns.com`, TTL = Automatic.
- For the apex domain (root): you have two options:
   - Point A record to Vercel’s edge: Add an A record, Host = `@`, Value = `76.76.21.21`, TTL = Automatic.
   - Also add a CNAME for `www` → `cname.vercel-dns.com` so `www.example.com` works.
   - Alternatively, switch nameservers to Vercel and manage DNS there (optional; Vercel will provide nameserver values).

3) Verify domain in Vercel
- Return to Vercel Domains page and click “Refresh”. Once DNS propagates, it will show as Verified, and SSL will be auto-provisioned.
- Set your preferred domain as “Primary”.

4) Update environment
- Set `NEXT_PUBLIC_BASE_URL=https://<your-domain>` in Vercel env vars and redeploy so redirects/webhooks use the correct domain.

## Build tips and reliability
- This repo includes a `postinstall` script to generate Prisma client on the server.
- Make sure NEXT_PUBLIC_BASE_URL matches your deployed URL to ensure correct success/cancel redirects.
- Use preview deployments (per-branch) as short-lived testing URLs. Promote to Production when ready.

## Rollback/redeploy
- Vercel keeps previous builds. You can redeploy or rollback from the UI.

---

Short checklist for staging (Postgres + (fake) payments)
- [ ] Import project into Vercel
- [ ] Add env vars (DATABASE_URL, NEXT_PUBLIC_BASE_URL, PAYMENTS_PROVIDER, NEXT_PUBLIC_PAYMENTS_PROVIDER, optional Stripe/Resend keys)
- [ ] Add post-deploy command: `npx prisma migrate deploy`
- [ ] Deploy and test `/booking` flow on the preview URL
