# ProposalDock production launch runbook

This is the final step-by-step runbook for launching ProposalDock on a real domain.

## A. Manual setup in external services

### 1. Domain and hosting

- Create the Vercel project
- Connect the Git repository
- Add your production domain
- Confirm SSL is active

### 2. Database

- Create a hosted Postgres database
- Copy the connection string
- Save it as both `DATABASE_URL` and `POSTGRES_DATABASE_URL` in production

### 3. File storage

- Create a Vercel Blob store or equivalent production bucket
- Copy the token into `BLOB_READ_WRITE_TOKEN`

### 4. Anthropic

- Create or choose a production Anthropic API key
- Add it as `ANTHROPIC_API_KEY`
- Keep `ANTHROPIC_MODEL=claude-sonnet-4-6`

### 5. Stripe

- Create the `Pro` and `Team` products
- Create recurring price objects for each plan
- Copy:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PRICE_PRO`
  - `STRIPE_PRICE_TEAM`
- Create a webhook endpoint for:
  - `/api/billing/webhook`
- Copy `STRIPE_WEBHOOK_SECRET`

### 6. Monitoring

- Create a Sentry project or another monitoring destination
- Copy the DSN into `SENTRY_DSN`

## B. Manual setup in Vercel

Add these environment variables:

- `APP_URL`
- `DATABASE_URL`
- `POSTGRES_DATABASE_URL`
- `AUTH_SECRET`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- `BLOB_READ_WRITE_TOKEN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_TEAM`
- `SENTRY_DSN`

Use [C:\Users\goran\proposalflow\.env.production.example](C:\Users\goran\proposalflow\.env.production.example) as the source template.

## C. Manual commands to run

From the project root:

```powershell
cd C:\Users\goran\proposalflow
npm install
npm run launch:preflight
npm run db:generate:postgres
npm run db:push:postgres
```

If you want to migrate your current local beta data:

```powershell
npm run db:migrate:sqlite-to-postgres
```

## D. Manual validation after deploy

Open and verify:

- `/status`
- `/privacy`
- `/terms`
- `/launch-checklist`
- `/contact`

Then test:

1. signup
2. login
3. create workspace
4. upload file
5. analyze
6. review and export
7. submit contact-sales form
8. Stripe checkout in test mode

## E. Manual go-live checks

- Confirm `robots.txt` is indexable on the real domain
- Confirm `sitemap.xml` loads
- Confirm legal pages are linked from the landing page
- Confirm uploads go to cloud storage, not local disk
- Confirm health status no longer fails critical checks
- Confirm one full happy path works on mobile and desktop

Run this before launch for a quick env and readiness summary:

```powershell
npm run launch:preflight
```

## F. Launch recommendation

Do a soft launch first:

1. invite a few trusted users
2. watch errors and lead flow for 24-48 hours
3. then begin pushing broader traffic
