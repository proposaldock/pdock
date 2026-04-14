# ProposalDock Billing And Plan Test Matrix

Use this runbook after each production deploy that touches billing, pricing, entitlements, exports, or team access.

## Test setup

Create or keep these accounts in Stripe test mode:

- `free-test@proposaldock.com`
- `pro-test@proposaldock.com`
- `team-owner-test@proposaldock.com`
- `team-member-test@proposaldock.com`

Use separate browser profiles or incognito windows so sessions do not bleed together.

## Expected entitlements

### Free

- Can sign up and sign in
- Can create exactly 1 workspace
- Cannot use Knowledge Base
- Cannot export DOCX
- Cannot use print export pack
- Cannot switch workspace visibility to team-shared or selected teammates
- Cannot add or manage team members

### Pro

- Can sign up and complete paid checkout
- Can create unlimited workspaces
- Can use Knowledge Base
- Can export DOCX
- Can use print export pack
- Cannot use team management
- Cannot enable team-shared or selected-teammates workspace visibility

### Team

- Can sign up and complete paid checkout
- Can create unlimited workspaces
- Can use Knowledge Base
- Can export DOCX
- Can use print export pack
- Can add and remove team members
- Can change member roles
- Can switch workspace visibility to `Team shared`
- Can switch workspace visibility to `Selected teammates`

## Billing flow checks

### 1. Free signup

1. Register a new free account.
2. Confirm you land in the app without checkout.
3. Open Settings and confirm plan shows `FREE`.

Expected:

- No forced billing redirect
- Billing panel available
- No Stripe customer required yet

### 2. Pro signup intent

1. Open `/register?plan=pro`
2. Create a new account
3. Confirm app opens Stripe checkout automatically
4. Complete checkout with a Stripe test card

Recommended Stripe test card:

- `4242 4242 4242 4242`
- any future date
- any CVC
- any ZIP

Expected:

- Checkout opens after signup
- User returns to `/app/settings?billing=success`
- Billing status eventually becomes paid after webhook sync
- Account behaves like Pro

### 3. Team signup intent

1. Open `/register?plan=team`
2. Create a new account
3. Confirm app opens Stripe checkout automatically
4. Complete checkout with the Stripe test card

Expected:

- Checkout opens after signup
- User returns successfully
- Team features become usable

### 4. Existing paid user should not create duplicate subscriptions

1. Sign in as an already-paid Pro or Team user
2. Open Settings
3. Click the paid plan CTA again

Expected:

- User is sent to billing management instead of a fresh subscription checkout
- Stripe does not create a second parallel subscription

### 5. Billing portal

1. Sign in as a paid user
2. Click `Manage billing`

Expected:

- Stripe billing portal opens
- Customer can manage or cancel subscription

## Entitlement checks

### Free account

1. Create first workspace
2. Try creating a second workspace

Expected:

- First succeeds
- Second fails with a clear upgrade message

3. Open Knowledge Base and try creating an asset

Expected:

- UI shows plan restriction
- Direct POST attempts should return `403`

4. Open any workspace and try DOCX export

Expected:

- Export route is blocked
- Print pack is also blocked or redirected to billing/settings

5. Try changing workspace visibility to `Team shared` or `Selected teammates`

Expected:

- Server rejects change

6. Try adding a team member in Settings

Expected:

- Server rejects change

### Pro account

1. Create more than one workspace
2. Use Knowledge Base
3. Export summary, matrix, answers, and pack

Expected:

- All of the above work

4. Try to add a team member
5. Try to switch workspace visibility to team-based options

Expected:

- Server rejects both with Team-plan messaging

### Team account

1. Add `team-member-test@proposaldock.com`
2. Change the member role
3. Remove and re-add the member
4. Create a workspace and set visibility to `Team shared`
5. Confirm team member can see the workspace
6. Change visibility to `Selected teammates`
7. Confirm only selected teammate can access it

Expected:

- Team features work end to end

## Webhook and sync checks

### Stripe webhook delivery

In Stripe Dashboard:

1. Open Developers -> Webhooks
2. Open the ProposalDock webhook endpoint
3. Confirm recent deliveries include:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`

Expected:

- Deliveries show `2xx`
- No repeated signature or server errors

### In-app billing sync

After successful checkout:

1. Refresh Settings
2. Confirm plan badge updates
3. Confirm current period end is set for paid users

Expected:

- Billing state in the app matches Stripe test data

## Production smoke checks

After a billing deploy, run this short pass on the live domain:

1. Open `/api/health`
2. Confirm:
   - `authSecret: true`
   - `anthropic: true`
   - `blobStorage: true`
   - `databaseIsHosted: true`
   - `appUrl: true`
3. Confirm `billing: true` once Stripe env is fully configured

## Failure clues

### If checkout opens but plan never updates

Check:

- `STRIPE_WEBHOOK_SECRET`
- Stripe endpoint URL
- webhook delivery logs

### If a paid user can still do free-only behavior

Check:

- whether the latest deployment is live
- whether the account billing status is still `inactive`
- whether webhook sync completed

### If a free user can still use paid features

Check:

- route protection in production deployment
- whether the user accidentally has a paid Stripe subscription attached

## Go / no-go

Do not call billing production-ready until all of these are true:

- Pro signup completes checkout and unlocks Pro features
- Team signup completes checkout and unlocks Team features
- Free account is blocked from paid entitlements
- Paid users are not able to create duplicate subscriptions
- Stripe webhook deliveries are green
- Export and team-sharing behavior match the plan matrix above
