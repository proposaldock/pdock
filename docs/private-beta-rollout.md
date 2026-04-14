# ProposalDock Private Beta Rollout

## What is now production-minded

- Account auth with user-owned workspaces and knowledge assets
- Stripe checkout, billing portal, and webhook sync
- Cloud-ready file storage with Vercel Blob and local fallback
- Billing settings screen for plan management

## Local development

- Keep `DATABASE_URL="file:./dev.db"` for fast local iteration
- Leave `BLOB_READ_WRITE_TOKEN` empty to store uploads under `data/uploads`
- Leave Stripe vars empty until you want to test billing

## Production beta move

1. Provision managed Postgres
2. Switch Prisma datasource to `postgresql`
3. Run `prisma migrate deploy`
4. Set Vercel Blob token
5. Set Stripe secret, price, and webhook vars
6. Point Stripe webhook to `/api/billing/webhook`

## Why the repo still uses SQLite locally

This workspace does not have Docker or a local Postgres runtime available, so the local developer path stays fast and verifiable. The app now carries the billing and storage layers needed for private beta without breaking the working local MVP.
