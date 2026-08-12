# Deployment

## Neon

1. Create Neon PostgreSQL project
2. Set `DATABASE_URL` (pooled) and `DIRECT_URL` (direct)
3. `pnpm prisma generate`
4. `pnpm prisma migrate deploy`
5. `pnpm db:seed` (optional; remove `[SEED]` products before launch)
6. `pnpm admin:create`
7. Verify connectivity

## Vercel

1. Push repository to GitHub
2. Import into Vercel
3. Add all production environment variables from `.env.example`
4. Set `NEXT_PUBLIC_SITE_URL` to the production domain
5. Set `AUTH_URL` to the production domain
6. Deploy
7. Run migrations (`prisma migrate deploy`) against production DB if not automated
8. Attach custom domain and confirm HTTPS
9. Verify WhatsApp checkout on mobile and desktop
10. Verify admin login and Cloudinary uploads
11. Confirm product edits appear on the storefront without redeploy
12. Confirm inventory changes after confirm/cancel/expire

## Cron

`vercel.json` schedules:

```text
*/10 * * * *  →  /api/cron/release-expired-reservations
```

Vercel should send the authorization secret; the route also accepts `Authorization: Bearer $CRON_SECRET`.

## Backup and recovery

- Enable Neon automated backups / point-in-time recovery
- Export orders and inventory CSV regularly from admin
- Store secrets in Vercel env, not in git
- Keep a recovery admin account procedure via `pnpm admin:reset-password`
