import { NextResponse } from "next/server";
import { db, users, creditTransactions } from "@/db";
import { requireUser } from "@/lib/auth";
import { CREDIT_PACKAGES } from "@/lib/stripe";
import { eq, desc } from "drizzle-orm";

// GET /api/billing - Get billing information
export async function GET() {
  console.log("[API /api/billing GET] Fetching billing info...");
  try {
    const user = await requireUser();
    console.log("[API /api/billing GET] User:", user.id);

    // Get current credits
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      columns: { credits: true },
    });

    // Get recent transactions
    const transactions = await db
      .select({
        id: creditTransactions.id,
        amount: creditTransactions.amount,
        type: creditTransactions.type,
        description: creditTransactions.description,
        createdAt: creditTransactions.createdAt,
      })
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, user.id))
      .orderBy(desc(creditTransactions.createdAt))
      .limit(50);

    console.log("[API /api/billing GET] Credits:", currentUser?.credits, "Transactions:", transactions.length);
    return NextResponse.json({
      credits: currentUser?.credits ?? 0,
      transactions,
      packages: CREDIT_PACKAGES,
    });
  } catch (error) {
    console.error("[API /api/billing GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing information" },
      { status: 500 }
    );
  }
}
