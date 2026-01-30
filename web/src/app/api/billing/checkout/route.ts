import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { stripe, getPackageById } from "@/lib/stripe";

// POST /api/billing/checkout - Create a Stripe checkout session
export async function POST(request: NextRequest) {
  console.log("[API /api/billing/checkout POST] Creating checkout session...");
  try {
    const user = await requireUser();
    console.log("[API /api/billing/checkout POST] User:", user.id);
    const body = await request.json();
    const { packageId } = body;
    console.log("[API /api/billing/checkout POST] Package:", packageId);

    const pkg = getPackageById(packageId);
    if (!pkg) {
      console.log("[API /api/billing/checkout POST] Invalid package:", packageId);
      return NextResponse.json(
        { error: "Invalid package selected" },
        { status: 400 }
      );
    }

    const origin = request.headers.get("origin") ?? "http://localhost:3000";

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: pkg.currency,
            product_data: {
              name: `${pkg.credits.toLocaleString()} API Credits`,
              description: `Add ${pkg.credits.toLocaleString()} credits to your VisionPipe account`,
            },
            unit_amount: pkg.price * 100, // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/c/cloud/billing?success=true`,
      cancel_url: `${origin}/c/cloud/billing?canceled=true`,
      metadata: {
        userId: user.id,
        packageId: pkg.id,
        credits: pkg.credits.toString(),
      },
      customer_email: user.email,
    });

    console.log("[API /api/billing/checkout POST] Session created:", session.id);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[API /api/billing/checkout POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
