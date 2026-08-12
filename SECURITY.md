# Security

## Authentication

- Auth.js credentials provider for admins only
- Passwords hashed with Argon2id
- Secure HTTP-only session cookies; `secure` in production
- No public registration, no hardcoded backdoors

## Authorization

- Middleware gates `/admin/*` except `/admin/login`
- Server-side `requireAdmin()` on every admin API
- Role field supports `ADMIN` and `SUPER_ADMIN`

## Abuse controls

- Login rate limit by IP + email
- Order creation rate limit by IP + phone
- Cron endpoint protected by `CRON_SECRET` with constant-time compare

## Data safety

- Zod validation on inputs
- Prisma parameterized queries
- Mass-assignment allowlists on product/settings updates
- Text sanitization for customer notes/addresses
- Phone/email masked in general logs
- Secrets never exposed via `NEXT_PUBLIC_*`

## HTTP headers

Middleware sets CSP, HSTS (prod), X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options.

## Uploads

Cloudinary signed uploads; 5MB limit; jpeg/png/webp only.

## Inventory integrity

Transactional updates and application checks prevent negative stock. Releases are idempotent.
