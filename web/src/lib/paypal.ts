import { config } from "./config";

// Credit packages available for purchase
export const CREDIT_PACKAGES = [
  { id: "credits_1", credits: 1, price: 1, currency: "USD" },
  { id: "credits_6", credits: 6, price: 5, currency: "USD" },
  { id: "credits_30", credits: 30, price: 20, currency: "USD" },
] as const;

export type CreditPackage = (typeof CREDIT_PACKAGES)[number];

export function getPackageById(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((pkg) => pkg.id === id);
}

// PayPal API base URL
function getPayPalBaseUrl(): string {
  return config.paypal.mode === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";
}

// Get PayPal access token
async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${config.paypal.clientId}:${config.paypal.clientSecret}`
  ).toString("base64");

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

// Create PayPal order
export async function createOrder(
  pkg: CreditPackage,
  userId: string
): Promise<{ id: string; approvalUrl: string }> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: pkg.currency,
            value: pkg.price.toFixed(2),
          },
          description: `${pkg.credits} API Credits`,
          custom_id: JSON.stringify({
            userId,
            packageId: pkg.id,
            credits: pkg.credits,
          }),
        },
      ],
      application_context: {
        brand_name: "what-is",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
      },
    }),
  });

  const order = await response.json();

  const approvalUrl = order.links?.find(
    (link: { rel: string; href: string }) => link.rel === "approve"
  )?.href;

  return { id: order.id, approvalUrl };
}

// Capture PayPal order (after user approves)
export async function captureOrder(orderId: string): Promise<{
  success: boolean;
  paymentId?: string;
  customData?: { userId: string; packageId: string; credits: number };
  error?: string;
}> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${getPayPalBaseUrl()}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (data.status === "COMPLETED") {
    const customId =
      data.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id;
    const paymentId = data.purchase_units?.[0]?.payments?.captures?.[0]?.id;

    let customData;
    try {
      customData = customId ? JSON.parse(customId) : undefined;
    } catch {
      customData = undefined;
    }

    return { success: true, paymentId, customData };
  }

  return { success: false, error: data.message || "Payment capture failed" };
}

// Verify webhook signature
export async function verifyWebhookSignature(
  webhookId: string,
  headers: {
    "paypal-auth-algo": string;
    "paypal-cert-url": string;
    "paypal-transmission-id": string;
    "paypal-transmission-sig": string;
    "paypal-transmission-time": string;
  },
  body: string
): Promise<boolean> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${getPayPalBaseUrl()}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: headers["paypal-auth-algo"],
        cert_url: headers["paypal-cert-url"],
        transmission_id: headers["paypal-transmission-id"],
        transmission_sig: headers["paypal-transmission-sig"],
        transmission_time: headers["paypal-transmission-time"],
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      }),
    }
  );

  const data = await response.json();
  return data.verification_status === "SUCCESS";
}
