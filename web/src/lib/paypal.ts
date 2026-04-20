import {
  CheckoutPaymentIntent,
  Client,
  Environment,
  OrderApplicationContextLandingPage,
  OrderApplicationContextUserAction,
  OrderRequest,
  OrdersController,
  OrderStatus,
} from "@paypal/paypal-server-sdk";
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

let cachedClient: Client | null = null;

function getClient(): Client {
  if (cachedClient) return cachedClient;
  cachedClient = new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: config.paypal.clientId,
      oAuthClientSecret: config.paypal.clientSecret,
    },
    environment:
      config.paypal.mode === "sandbox"
        ? Environment.Sandbox
        : Environment.Production,
    timeout: 0,
  });
  return cachedClient;
}

function getOrdersController(): OrdersController {
  return new OrdersController(getClient());
}

// Create PayPal order
export async function createOrder(
  pkg: CreditPackage,
  userId: string
): Promise<{ id: string; approvalUrl: string }> {
  const orderRequest: OrderRequest = {
    intent: CheckoutPaymentIntent.Capture,
    purchaseUnits: [
      {
        amount: {
          currencyCode: pkg.currency,
          value: pkg.price.toFixed(2),
        },
        description: `${pkg.credits} API Credits`,
        customId: JSON.stringify({
          userId,
          packageId: pkg.id,
          credits: pkg.credits,
        }),
      },
    ],
    applicationContext: {
      brandName: config.site.name,
      landingPage: OrderApplicationContextLandingPage.NoPreference,
      userAction: OrderApplicationContextUserAction.PayNow,
    },
  };

  const { result } = await getOrdersController().createOrder({
    body: orderRequest,
  });

  const approvalUrl =
    result.links?.find((link) => link.rel === "approve")?.href ?? "";

  return { id: result.id ?? "", approvalUrl };
}

// Capture PayPal order (after user approves)
export async function captureOrder(orderId: string): Promise<{
  success: boolean;
  paymentId?: string;
  customData?: { userId: string; packageId: string; credits: number };
  error?: string;
}> {
  try {
    const { result } = await getOrdersController().captureOrder({
      id: orderId,
    });

    if (result.status === OrderStatus.Completed) {
      const capture = result.purchaseUnits?.[0]?.payments?.captures?.[0];
      const customId = capture?.customId;
      const paymentId = capture?.id;

      let customData;
      try {
        customData = customId ? JSON.parse(customId) : undefined;
      } catch {
        customData = undefined;
      }

      return { success: true, paymentId, customData };
    }

    return { success: false, error: "Payment capture failed" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Payment capture failed";
    return { success: false, error: message };
  }
}

// Verify webhook signature (PayPal SDK does not expose a webhook controller,
// so we call the REST endpoint directly using an access token from the SDK)
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
  const { accessToken } = await getClient().clientCredentialsAuthManager.fetchToken();

  const baseUrl =
    config.paypal.mode === "sandbox"
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";

  const response = await fetch(
    `${baseUrl}/v1/notifications/verify-webhook-signature`,
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
