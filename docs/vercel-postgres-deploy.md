# ProposalDock deploy guide

This is the practical path to get ProposalDock online on Vercel with a hosted Postgres database.

## 1. Create production services

- Create a Vercel project for the repo.
- Create a hosted Postgres database.
- Create a Vercel Blob store or another production file storage bucket.
- Create Stripe products and prices for `Pro` and `Team`.
- Create an Anthropic API key for production.

## 2. Set production environment variables

Set these in Vercel project settings:

- `APP_URL=https://your-domain`
- `DATABASE_URL=postgresql://...`
- `POSTGRES_DATABASE_URL=postgresql://...`
- `AUTH_SECRET=...`
- `ANTHROPIC_API_KEY=...`
- `ANTHROPIC_MODEL=claude-sonnet-4-6`
- `BLOB_READ_WRITE_TOKEN=...`
- `STRIPE_SECRET_KEY=...`
- `STRIPE_WEBHOOK_SECRET=...`
- `STRIPE_PRICE_PRO=price_...`
- `STRIPE_PRICE_TEAM=price_...`
- `SENTRY_DSN=...` if you are using Sentry

## 3. Use the Postgres Prisma schema for launch

The main application schema now uses Postgres from `prisma/schema.prisma`, which matches Vercel production. A separate SQLite schema lives at `prisma/schema.sqlite.prisma` for local migration and fallback tooling.

1. Set `DATABASE_URL` to your hosted Postgres connection string
2. Run:

```powershell
npm run db:generate:postgres
npm run db:push:postgres
```

3. If you want to copy your current local beta data into Postgres, set:

```env
POSTGRES_DATABASE_URL=postgresql://...
SQLITE_DATABASE_URL=file:./prisma/dev.db
```

Then run:

```powershell
npm run db:migrate:sqlite-to-postgres
```

4. If you still want to inspect or maintain a local SQLite file, keep `SQLITE_DATABASE_URL=file:./dev.db` and use the SQLite-specific scripts when needed:

```powershell
npm run db:generate:sqlite
npm run db:push:sqlite
```

## 4. Verify before public traffic

- Open `/status`
- Open `/privacy`
- Open `/terms`
- Open `/launch-checklist`
- Create a test account
- Create a workspace and run one analysis
- Upload a file and verify it stores in cloud storage
- Run Stripe checkout in test mode

## 5. Turn on indexing only when ready

`robots.ts` currently blocks indexing outside a real production domain. Once `APP_URL` is set to your real domain, public pages become indexable and the sitemap is exposed automatically.
