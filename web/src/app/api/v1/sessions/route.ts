import { NextRequest, NextResponse } from "next/server";
import { db, users, apiKeys, creditTransactions } from "@/db";
import { eq, sql, isNull, and } from "drizzle-orm";
import { hashApiKey, isValidApiKeyFormat } from "@/lib/api-keys";
import { generatePlaygroundToken } from "@/lib/jwt";
import { config } from "@/lib/config";

// POST /api/v1/sessions - Start a playground session using API key
export async function POST(request: NextRequest) {
  try {
    // Extract API key from Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 }
      );
    }

    const apiKey = authHeader.slice(7); // Remove "Bearer " prefix

    // Validate API key format
    if (!isValidApiKeyFormat(apiKey)) {
      return NextResponse.json(
        { error: "Invalid API key format" },
        { status: 401 }
      );
    }

    // Hash the key and look up in database
    const keyHash = hashApiKey(apiKey);
    const [foundKey] = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.deletedAt)))
      .limit(1);

    if (!foundKey) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    // Get the user associated with this API key
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, foundKey.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has credits
    if (user.credits < 1) {
      return NextResponse.json(
        { error: "Insufficient credits", credits: user.credits },
        { status: 402 }
      );
    }

    // Deduct 1 credit
    const [updatedUser] = await db
      .update(users)
      .set({
        credits: sql`${users.credits} - 1`,
      })
      .where(eq(users.id, user.id))
      .returning();

    // Record transaction
    await db.insert(creditTransactions).values({
      userId: user.id,
      amount: -1,
      type: "usage",
      description: "Playground session (API)",
    });

    // Update API key last used timestamp
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, foundKey.id));

    // Generate JWT token for playground access
    const token = await generatePlaygroundToken(user.id, foundKey.id);

    // Build playground URL
    const playgroundUrl = `${config.app.url}/playground?token=${token}`;

    return NextResponse.json({
      success: true,
      credits: updatedUser.credits,
      playgroundUrl,
      token,
      expiresIn: config.jwt.expirySeconds,
    });
  } catch (error) {
    console.error("[API /v1/sessions] Error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
