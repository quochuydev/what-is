# Step 6: Deploy to Vercel

## Overview

Deploy the Next.js app to Vercel and configure all environment variables collected from previous steps.

## Deploy

### 1. Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Connect your GitHub account if not already connected
3. Select your `what-is` repository
4. **Set Root Directory to `web`** — this is critical, the Next.js app lives in `web/`, not the repo root

### 2. Configure Environment Variables

Before clicking Deploy, add all environment variables under **Environment Variables**:

#### Clerk (from Step 3)

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_xxxxx` |
| `CLERK_SECRET_KEY` | `sk_live_xxxxx` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/login` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/c/cloud/api-keys` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/c/cloud/api-keys` |

#### Database (from Step 2)

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` |

#### JWT

| Variable | Value |
|----------|-------|
| `JWT_SECRET` | Generate a random string (see below) |

Generate a secure JWT secret:

```bash
openssl rand -base64 32
```

#### PayPal (from Step 4)

| Variable | Value |
|----------|-------|
| `PAYPAL_CLIENT_ID` | Your PayPal Client ID |
| `PAYPAL_CLIENT_SECRET` | Your PayPal Client Secret |
| `PAYPAL_MODE` | `sandbox` or `live` |
| `PAYPAL_WEBHOOK_ID` | Your PayPal Webhook ID |

#### LLM (from Step 5)

| Variable | Value |
|----------|-------|
| `LLM_API_KEY` | Your LLM provider API key |
| `LLM_BASE_URL` | `https://api.deepseek.com/v1` |
| `LLM_MODEL` | `deepseek-chat` |

**Total: 14 environment variables**

### 3. Deploy

Click **Deploy**. Vercel will:

1. Install dependencies (`npm install`)
2. Build the Next.js app (`next build`)
3. Deploy to a `.vercel.app` domain

### 4. Configure Custom Domain (Optional)

1. Go to your project **Settings > Domains**
2. Add your custom domain
3. Update DNS records as instructed by Vercel

### 5. Update Clerk Production Domain

After deployment, update Clerk to recognize your production domain:

1. In Clerk dashboard, go to **Domains**
2. Add your Vercel domain (e.g., `what-is-xxx.vercel.app` or your custom domain)

## Verify Deployment

After deployment, test these pages:

- [ ] Homepage loads at `/`
- [ ] Docs load at `/docs`
- [ ] Blog loads at `/blog`
- [ ] Pricing page loads at `/pricing`
- [ ] Login redirects to Clerk at `/login`
- [ ] Playground page loads at `/playground`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails with module errors | Ensure root directory is set to `web` |
| Auth not working | Check Clerk keys match the environment (test vs live) |
| Database connection fails | Verify `DATABASE_URL` includes `?sslmode=require` for hosted PostgreSQL |
| Pages return 500 | Check Vercel function logs for missing environment variables |

## Next Step

[Step 7: Push Database Schema](./7-database-schema.md)
