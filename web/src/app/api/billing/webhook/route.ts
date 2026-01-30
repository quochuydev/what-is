import { NextRequest, NextResponse } from "next/server";
import { db, users, creditTransactions } from "@/db";
import { stripe } from "@/lib/stripe";
import { config } from "@/lib/config";
import { eq, sql } from "drizzle-orm";
import Stripe from "stripe";

// POST /api/billing/webhook - Handle Stripe webhooks
export async function POST(request: NextRequest) {
  console.log("[Webhook] Received Stripe webhook");
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !config.stripe.webhookSecret) {
    console.log("[Webhook] Missing signature or webhook secret");
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      config.stripe.webhookSecret
    );
    console.log("[Webhook] Event verified:", event.type);
  } catch (err) {
    console.error("[Webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    console.log("[Webhook] Processing checkout.session.completed");
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, credits, packageId } = session.metadata ?? {};
    console.log("[Webhook] Session metadata:", { userId, credits, packageId });

    if (!userId || !credits) {
      console.error("[Webhook] Missing metadata in checkout session:", session.id);
      return NextResponse.json({ received: true });
    }

    const creditsAmount = parseInt(credits, 10);

    try {
      // Add credits to user
      await db
        .update(users)
        .set({
          credits: sql`${users.credits} + ${creditsAmount}`,
        })
        .where(eq(users.id, userId));

      // Record transaction
      await db.insert(creditTransactions).values({
        userId,
        amount: creditsAmount,
        type: "purchase",
        stripePaymentId: session.payment_intent as string,
        description: `Purchased ${creditsAmount.toLocaleString()} credits (${packageId})`,
      });

      console.log("[Webhook] Added", creditsAmount, "credits to user", userId);
    } catch (error) {
      console.error("[Webhook] Error processing payment:", error);
      return NextResponse.json(
        { error: "Failed to process payment" },
        { status: 500 }
      );
    }
  } else {
    console.log("[Webhook] Unhandled event type:", event.type);
  }

  return NextResponse.json({ received: true });
}
