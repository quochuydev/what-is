import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createOrder, getPackageById } from "@/lib/paypal";

// POST /api/billing/checkout - Create a PayPal order
export async function POST(request: NextRequest) {
  console.log("[API /api/billing/checkout POST] Creating PayPal order...");
  try {
    const user = await requireUser();
    console.log("[API /api/billing/checkout POST] User:", user.id);
    const body = await request.json();
    const { packageId } = body;
    console.log("[API /api/billing/checkout POST] Package:", packageId);

    const pkg = getPackageById(packageId);
    if (!pkg) {
      console.log(
        "[API /api/billing/checkout POST] Invalid package:",
        packageId
      );
      return NextResponse.json(
        { error: "Invalid package selected" },
        { status: 400 }
      );
    }

    // Create PayPal order
    const order = await createOrder(pkg, user.id);

    console.log("[API /api/billing/checkout POST] Order created:", order.id);
    return NextResponse.json({
      orderId: order.id,
      approvalUrl: order.approvalUrl,
    });
  } catch (error) {
    console.error("[API /api/billing/checkout POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to create PayPal order" },
      { status: 500 }
    );
  }
}
