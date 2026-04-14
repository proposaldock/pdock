# ProposalDock production launch checklist

Use this checklist before sending real traffic to ProposalDock.

## Infrastructure

- Set `APP_URL` to the production domain.
- Move `DATABASE_URL` from local SQLite to hosted Postgres.
- Set `BLOB_READ_WRITE_TOKEN` so uploads no longer rely on local disk.
- Confirm `AUTH_SECRET` is long, unique, and production-only.

## AI and billing

- Verify `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL`.
- Configure `STRIPE_SECRET_KEY`.
- Configure `STRIPE_WEBHOOK_SECRET`.
- Configure `STRIPE_PRICE_PRO` and `STRIPE_PRICE_TEAM`.
- Run one full billing test in Stripe test mode.

## Monitoring and support

- Configure `SENTRY_DSN` or your preferred monitoring destination.
- Test one forced server error and confirm it is visible in monitoring.
- Confirm logs are available for auth, uploads, analysis, and export failures.

## Product checks

- Verify signup and login on the production domain.
- Verify file upload, analysis, review, proposal assembly, and export.
- Verify team invite and workspace sharing behavior.
- Verify contact-sales and waitlist forms save successfully.
- Verify privacy policy and terms pages are reachable from the marketing site.

## Launch pass

- Review landing page copy and pricing.
- Test mobile and desktop.
- Confirm rate limiting is active on public routes.
- Run a final walkthrough from public landing page to first analyzed workspace.
