# Step 7: Push Database Schema

## Overview

The database schema must be pushed to your production PostgreSQL instance. This creates all the tables, indexes, and enums required by the app.

## Prerequisites

- Database provisioned and `DATABASE_URL` available (from Step 2)
- Node.js installed locally
- The repository cloned locally

## Push Schema

```bash
cd web
npm install --legacy-peer-deps
```

Create a `.env.local` file with your production database URL:

```bash
echo 'DATABASE_URL=postgresql://user:pass@host/db?sslmode=require' > .env.local
```

Then push the schema:

```bash
npx drizzle-kit push
```

You'll be prompted to confirm the changes. Type `yes` to apply.

## Expected Output

Drizzle will create:

**Enums:**
- `audit_action` — created, deleted, used
- `transaction_type` — purchase, usage, refund, admin_adjustment
- `analysis_status` — pending, processing, completed, failed

**Tables:**

| Table | Purpose |
|-------|---------|
| `users` | User accounts synced from Clerk |
| `api_keys` | API key storage with hashed keys |
| `api_key_audit_logs` | Audit trail for key operations |
| `usage_daily` | Daily API usage tracking |
| `credit_transactions` | Credit purchase and usage ledger |
| `analysis_requests` | CSV analysis job tracking |

## Verify

Open Drizzle Studio to browse the tables:

```bash
npx drizzle-kit studio
```

Or connect with any PostgreSQL client and run:

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

You should see all 6 tables listed.

## Post-Deployment Checklist

After completing all 7 steps, verify the full flow:

- [ ] Sign in with Google via Clerk
- [ ] User appears in the `users` table
- [ ] API key can be created at `/c/cloud/api-keys`
- [ ] Credit purchase works via PayPal at `/c/cloud/billing`
- [ ] Credits appear in the `credit_transactions` table
- [ ] Definition lookup works at `/playground`
- [ ] Usage shows up at `/c/cloud/usage`

## Schema Updates

If the schema changes in future updates, pull the latest code and run:

```bash
git pull
cd web
npx drizzle-kit push
```

Review the changes before confirming.

## Quick Reference — All Environment Variables

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/c/cloud/api-keys
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/c/cloud/api-keys

# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# JWT
JWT_SECRET=your-random-secret

# PayPal
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret
PAYPAL_MODE=live
PAYPAL_WEBHOOK_ID=your-webhook-id

# LLM
LLM_API_KEY=your-api-key
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_MODEL=deepseek-chat
```
