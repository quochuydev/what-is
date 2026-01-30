import { NextRequest, NextResponse } from "next/server";
import { db, users, creditTransactions } from "@/db";
import { verifyWebhookSignature } from "@/lib/paypal";
import { config } from "@/lib/config";
import { eq, sql } from "drizzle-orm";

// POST /api/billing/webhook - Handle PayPal webhooks
export async function POST(request: NextRequest) {
  console.log("[Webhook] Received PayPal webhook");

  const body = await request.text();

  // Get PayPal signature headers
  const headers = {
    "paypal-auth-algo": request.headers.get("paypal-auth-algo") || "",
    "paypal-cert-url": request.headers.get("paypal-cert-url") || "",
    "paypal-transmission-id":
      request.headers.get("paypal-transmission-id") || "",
    "paypal-transmission-sig":
      request.headers.get("paypal-transmission-sig") || "",
    "paypal-transmission-time":
      request.headers.get("paypal-transmission-time") || "",
  };

  // Verify webhook signature (skip in development if no webhook ID)
  if (config.paypal.webhookId) {
    try {
      const isValid = await verifyWebhookSignature(
        config.paypal.webhookId,
        headers,
        body
      );
      if (!isValid) {
        console.log("[Webhook] Signature verification failed");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
      console.log("[Webhook] Signature verified");
    } catch (err) {
      console.error("[Webhook] Signature verification error:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  const event = JSON.parse(body);
  console.log("[Webhook] Event type:", event.event_type);

  // Handle payment capture completed
  if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    console.log("[Webhook] Processing PAYMENT.CAPTURE.COMPLETED");

    const capture = event.resource;
    const customId = capture.custom_id;

    if (!customId) {
      console.error("[Webhook] Missing custom_id in capture");
      return NextResponse.json({ received: true });
    }

    let customData: { userId: string; packageId: string; credits: number };
    try {
      customData = JSON.parse(customId);
    } catch {
      console.error("[Webhook] Invalid custom_id format:", customId);
      return NextResponse.json({ received: true });
    }

    const { userId, packageId, credits } = customData;
    console.log("[Webhook] Custom data:", { userId, packageId, credits });

    try {
      // Add credits to user
      await db
        .update(users)
        .set({
          credits: sql`${users.credits} + ${credits}`,
        })
        .where(eq(users.id, userId));

      // Record transaction
      await db.insert(creditTransactions).values({
        userId,
        amount: credits,
        type: "purchase",
        paymentId: capture.id,
        description: `Purchased ${credits.toLocaleString()} credits (${packageId})`,
      });

      console.log("[Webhook] Added", credits, "credits to user", userId);
    } catch (error) {
      console.error("[Webhook] Error processing payment:", error);
      return NextResponse.json(
        { error: "Failed to process payment" },
        { status: 500 }
      );
    }
  } else {
    console.log("[Webhook] Unhandled event type:", event.event_type);
  }

  return NextResponse.json({ received: true });
}
