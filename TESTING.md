# Testing

## Commands

```bash
pnpm test
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm lint
pnpm typecheck
pnpm build
```

## Unit tests

Cover money formatting, free-shipping threshold (₹300 / ₹49), WhatsApp encoding, Zod validation, available stock, order numbers, reservation TTL.

## Integration tests

Require `DATABASE_URL`. Cover order creation, server price authority, stock reservation/release/confirm, idempotency, and authz where practical.

## End-to-end

Playwright covers browse → cart → checkout path expectations and admin login page availability. Expand against a seeded database for full inventory flows.

## Notes

- Mock Cloudinary/Resend when credentials are absent
- Do not assert on real WhatsApp delivery; assert on URL shape and order persistence
