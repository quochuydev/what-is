import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db, users, creditTransactions } from "@/db";
import { eq, sql } from "drizzle-orm";

// POST /api/sessions - Start a new playground session (deducts 1 credit)
export async function POST() {
  try {
    const user = await requireUser();
    console.log("[API /sessions] Starting session for user:", user.id);

    // Check if user has credits
    if (user.credits < 1) {
      console.log("[API /sessions] Insufficient credits:", user.credits);
      return NextResponse.json(
        { error: "Insufficient credits", credits: user.credits },
        { status: 402 }
      );
    }

    // Deduct 1 credit and create transaction record
    const [updatedUser] = await db
      .update(users)
      .set({
        credits: sql`${users.credits} - 1`,
      })
      .where(eq(users.id, user.id))
      .returning();

    await db.insert(creditTransactions).values({
      userId: user.id,
      amount: -1,
      type: "usage",
      description: "Playground session",
    });

    console.log("[API /sessions] Session started, credits remaining:", updatedUser.credits);

    return NextResponse.json({
      success: true,
      credits: updatedUser.credits,
    });
  } catch (error) {
    console.error("[API /sessions] Error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to start session" },
      { status: 500 }
    );
  }
}

// GET /api/sessions - Get user's current credits
export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({ credits: user.credits });
  } catch (error) {
    console.error("[API /sessions] Error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to get credits" },
      { status: 500 }
    );
  }
}
