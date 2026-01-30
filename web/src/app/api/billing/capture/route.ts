import { NextRequest, NextResponse } from "next/server";
import { db, users, creditTransactions } from "@/db";
import { requireUser } from "@/lib/auth";
import { captureOrder } from "@/lib/paypal";
import { eq, sql } from "drizzle-orm";

// POST /api/billing/capture - Capture a PayPal order after user approval
export async function POST(request: NextRequest) {
  console.log("[API /api/billing/capture POST] Capturing PayPal order...");
  try {
    const user = await requireUser();
    console.log("[API /api/billing/capture POST] User:", user.id);

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    console.log("[API /api/billing/capture POST] Order ID:", orderId);

    // Capture the order
    const result = await captureOrder(orderId);

    if (!result.success) {
      console.log("[API /api/billing/capture POST] Capture failed:", result.error);
      return NextResponse.json(
        { error: result.error || "Payment capture failed" },
        { status: 400 }
      );
    }

    // Verify the user matches
    if (result.customData?.userId !== user.id) {
      console.log("[API /api/billing/capture POST] User mismatch");
      return NextResponse.json(
        { error: "User mismatch" },
        { status: 403 }
      );
    }

    const { credits, packageId } = result.customData;

    // Add credits to user
    await db
      .update(users)
      .set({
        credits: sql`${users.credits} + ${credits}`,
      })
      .where(eq(users.id, user.id));

    // Record transaction
    await db.insert(creditTransactions).values({
      userId: user.id,
      amount: credits,
      type: "purchase",
      paymentId: result.paymentId,
      description: `Purchased ${credits.toLocaleString()} credits (${packageId})`,
    });

    console.log("[API /api/billing/capture POST] Added", credits, "credits to user", user.id);

    return NextResponse.json({
      success: true,
      credits,
    });
  } catch (error) {
    console.error("[API /api/billing/capture POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to capture payment" },
      { status: 500 }
    );
  }
}
