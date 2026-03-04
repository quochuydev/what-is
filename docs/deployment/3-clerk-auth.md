# Step 3: Set Up Clerk Authentication

## Overview

what-is uses [Clerk](https://clerk.com) for user authentication with Google OAuth. Clerk handles sign-up, sign-in, session management, and user profiles.

## Setup

### 1. Create a Clerk Account

1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application (e.g., `what-is`)

### 2. Configure Google OAuth

1. In the Clerk dashboard, go to **User & Authentication > Social Connections**
2. Enable **Google**
3. For production, you'll need your own Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one
   - Navigate to **APIs & Services > Credentials**
   - Create an **OAuth 2.0 Client ID** (Web application)
   - Add your production domain to authorized redirect URIs
   - Copy the Client ID and Client Secret into Clerk's Google settings

> For development/testing, Clerk provides shared Google credentials that work out of the box.

### 3. Configure Redirect URLs

In the Clerk dashboard, go to **Paths** and set:

| Setting | Value |
|---------|-------|
| Sign-in URL | `/login` |
| After sign-in URL | `/c/cloud/api-keys` |
| After sign-up URL | `/c/cloud/api-keys` |

### 4. Get API Keys

In the Clerk dashboard, go to **API Keys** and copy:

- **Publishable Key** — starts with `pk_test_` (development) or `pk_live_` (production)
- **Secret Key** — starts with `sk_test_` (development) or `sk_live_` (production)

## Environment Variables

Save these values — you'll need them in Step 6:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/c/cloud/api-keys
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/c/cloud/api-keys
```

## How It Works in the App

- **Middleware** (`src/middleware.ts`) protects all `/c/*` routes — unauthenticated users are redirected to `/login`
- **`requireUser()`** (`src/lib/auth.ts`) is used in API routes to verify auth and sync Clerk users to the database
- **Header** (`src/components/Header.tsx`) shows sign-in/sign-out buttons using Clerk's React components

## Next Step

[Step 4: Set Up PayPal Payments](./4-paypal-payments.md)
