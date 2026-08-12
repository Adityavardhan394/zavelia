# ZAVÉLIA

Premium jewellery and fashion-accessories e-commerce for **ZAVÉLIA** — *Elegance For Every You*.

One Next.js application powers:

1. **Customer storefront** — browse, filter, cart, WhatsApp checkout
2. **Admin portal** — products, inventory, orders, settings

Both share a Neon PostgreSQL database via Prisma.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md).

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn-style UI primitives
- PostgreSQL (Neon) + Prisma
- Auth.js (Credentials) + Argon2id
- Zustand cart persistence
- Cloudinary signed uploads
- Vitest + Playwright
- Vercel deployment + cron for expired reservations

## Prerequisites

- Node.js 20+
- pnpm 9+
- Neon PostgreSQL project (or local Postgres)
- Cloudinary account (for production images)
- WhatsApp Business number (digits with country code, no `+`)

## Installation

```bash
pnpm install
cp .env.example .env
```

Generate secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set `AUTH_SECRET` and `CRON_SECRET` in `.env`.

## Environment

See `.env.example`. Important:

- `DATABASE_URL` — Neon **pooled** connection
- `DIRECT_URL` — Neon **direct** connection (migrations)
- `WHATSAPP_BUSINESS_NUMBER` — country code + digits only (example: `9198XXXXXXXX`)
- Never commit a filled `.env`

## Neon setup

1. Create a Neon project
2. Copy pooled URL → `DATABASE_URL`
3. Copy direct URL → `DIRECT_URL`
4. Run:

```bash
pnpm prisma generate
pnpm prisma migrate deploy
pnpm db:seed
pnpm admin:create
```

## Cloudinary setup

1. Create a Cloudinary cloud
2. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
3. Admin product images use signed uploads (`/api/admin/uploads/sign`)

## Admin creation

```bash
pnpm admin:create
pnpm admin:disable
pnpm admin:reset-password
```

No public registration. No plaintext admin passwords in the repo.

## Local development

```bash
pnpm dev
```

- Storefront: http://localhost:3000
- Admin: http://localhost:3000/admin/login

## Tests

```bash
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm lint
pnpm typecheck
pnpm build
```

## WhatsApp checkout flow

1. Customer completes delivery form
2. Server recalculates prices and shipping
3. Pending order created (`WHATSAPP_PENDING`, payment `UNPAID`)
4. Stock reserved atomically for 30 minutes
5. Encoded `wa.me` URL returned and opened
6. Opening WhatsApp does **not** mark the order paid
7. Admin confirms → reserved stock converts to stock-out
8. Cancel/expire/manual release → reserved stock released once

Free shipping at **₹300+**; otherwise **₹49**.

## Security

See [SECURITY.md](./SECURITY.md).

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md).

## Logo

Place the official artwork at `public/brand/zavelia-logo.png`. A temporary brand-safe placeholder may exist for local development; replace it with the official supplied logo before launch (do not redesign spelling or accent: **ZAVÉLIA**).

## Values you must supply before production

- WhatsApp business number
- Support email / phone / address
- Production domain
- Neon credentials
- Cloudinary credentials
- Resend credentials (optional notifications)
- Official logo file (if not already integrated)
