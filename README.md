# Alpine School — Ski Booking MVP

Apple‑inspired minimal Next.js (App Router) + Tailwind scaffold with starter pages.

## Quick start

1. Install dependencies

```bash
npm install
```

2. Run the dev server

```bash
npm run dev
```

Then open http://localhost:3000.

## Configure database, Stripe, email

1) Copy env template and fill values

```bash
cp .env.example .env
```

- `DATABASE_URL`: Postgres from Neon/Supabase
- `NEXT_PUBLIC_BASE_URL`: http://localhost:3000 (local) or your production domain
- `PAYMENTS_PROVIDER`: `stripe` (real) or `fake` (no processor)
- `NEXT_PUBLIC_PAYMENTS_PROVIDER`: same as above, but client‑side
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: from Stripe dashboard
- `STRIPE_WEBHOOK_SECRET`: from `stripe listen` or dashboard webhook
- `RESEND_API_KEY`, `BOOKINGS_FROM_EMAIL`: for confirmation emails

2) Setup database with Prisma

```bash
npx prisma generate
npx prisma migrate dev -n init
npx tsx prisma/seed.ts
```

3) Run Stripe webhook locally (optional but recommended)

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4) Start dev server

```bash
npm run dev
```

## Booking flow (realistic)

- Client posts to `/api/bookings` with lesson details and contact info.
- Server creates a pending booking in Postgres and a Stripe Checkout Session.
- Client redirects to Stripe; on success, Stripe calls the webhook.
- Webhook marks booking as `paid`, increments slot capacity, and emails a confirmation.

### Fake payments mode (no real processor)
- Set `PAYMENTS_PROVIDER=fake` and `NEXT_PUBLIC_PAYMENTS_PROVIDER=fake` in `.env`.
- The booking page will show a card form after creating a pending booking.
- API validates with Luhn and stores only non‑sensitive metadata (brand, last4, expiry) in `Payment` table, then marks booking `paid` and emails confirmation.
- Never enter real card numbers; this is for demos only and is not PCI compliant for production use.

## Deploy

- Push to GitHub and import the repo in Vercel.
- In Vercel Project → Settings → Environment Variables: set all `.env` keys.
- Run migrations: add a deploy step `npx prisma migrate deploy` or run once from a one‑off script.
- In Stripe → Developers → Webhooks: add a production webhook endpoint pointing to `/api/stripe/webhook`.
- Add your custom domain in Vercel; update DNS; SSL auto‑provisions.

## Notes

- Capacity checks are basic for MVP. For strict oversell protection, use serializable transactions and row‑level locking.
- Admin dashboard and Auth.js are not wired yet; can be added as a next step.

## Structure

- `src/app` — App Router pages (`/`, `/lessons`, `/booking`, `/policies`).
- `src/components` — Header, Footer, Hero.
- `tailwind.config.ts` — Apple‑like theme (system font, near‑black, ice blue accent).
- `src/app/globals.css` — Tailwind directives + minimal base styles.

## Next steps

- Wire booking form to an email, Google Form, or Stripe Payment Link.
- Add real content (copy, pricing, images, FAQs).
- Deploy on Vercel or Netlify.
