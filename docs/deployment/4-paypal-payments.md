# Step 4: Set Up PayPal Payments

## Overview

what-is uses PayPal for credit purchases. Users buy credit packages via PayPal checkout, and credits are added to their account upon successful payment.

## Credit Packages

| Package | Credits | Price |
|---------|---------|-------|
| Starter | 1 | $1.00 |
| Growth | 6 | $5.00 |
| Scale | 30 | $20.00 |

## Account Type

A **personal PayPal account** is sufficient — no business account required. Payments go to whichever PayPal email owns the API credentials.

This is useful if you're in a country (e.g., Vietnam) where PayPal business accounts are restricted. Personal accounts can receive payments with some limits:

- Receiving cap (~$500/month without full identity verification)
- Verify your identity in PayPal to lift limits
- Link a Visa/Mastercard to withdraw funds to your local bank

## Setup

### 1. Create a PayPal Account

1. Sign up at [paypal.com](https://www.paypal.com) with your personal email
2. Go to [developer.paypal.com](https://developer.paypal.com) and sign in with the same account
3. Navigate to **Apps & Credentials**

### 2. Create an App

1. Click **Create App**
2. Enter app name (e.g., `what-is`)
3. Select **Merchant** as the app type
4. Choose **Sandbox** for testing or **Live** for production
5. Click **Create App**

### 3. Get API Credentials

From your app's detail page, copy:

- **Client ID**
- **Client Secret** (click "Show" to reveal)

### 4. Set Up Webhook

This is important for reliable payment processing. The webhook acts as a backup to confirm payments.

1. In your app settings, scroll to **Webhooks**
2. Click **Add Webhook**
3. Set the webhook URL to: `https://your-domain.com/api/billing/webhook`
4. Subscribe to this event:
   - `PAYMENT.CAPTURE.COMPLETED`
5. Click **Save**
6. Copy the **Webhook ID** from the webhook list

> **Note:** You need your deployed URL to create the webhook. You can either:
> - Deploy first without the webhook ID, then come back and add it
> - Use a placeholder and update the env var after deployment

### 5. Sandbox Testing (Recommended)

PayPal provides sandbox accounts for testing:

1. Go to **Sandbox > Accounts** in the developer dashboard
2. Use the pre-created **Personal** sandbox account for test purchases
3. Default sandbox credentials are shown on the account detail page

## Environment Variables

Save these values — you'll need them in Step 6:

```
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret
PAYPAL_MODE=sandbox
PAYPAL_WEBHOOK_ID=your-webhook-id
```

Set `PAYPAL_MODE=live` when ready for production.

## Payment Flow

```
User clicks "Buy Now" on /c/cloud/billing
  → POST /api/billing/checkout (creates PayPal order)
  → User redirected to PayPal to approve
  → POST /api/billing/capture (captures payment, adds credits)
  → PayPal sends webhook to /api/billing/webhook (backup fulfillment)
```

## Next Step

[Step 5: Get an LLM API Key](./5-llm-api-key.md)
