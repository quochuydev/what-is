import { NextRequest, NextResponse } from "next/server";
import { db, apiKeys, apiKeyAuditLogs } from "@/db";
import { requireUser } from "@/lib/auth";
import { generateApiKey } from "@/lib/api-keys";
import { eq, and, isNull, desc } from "drizzle-orm";

// GET /api/keys - List all API keys for the current user
export async function GET() {
  console.log("[API /api/keys GET] Fetching keys...");
  try {
    const user = await requireUser();
    console.log("[API /api/keys GET] User:", user.id);

    const keys = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        keyPrefix: apiKeys.keyPrefix,
        lastUsedAt: apiKeys.lastUsedAt,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(and(eq(apiKeys.userId, user.id), isNull(apiKeys.deletedAt)))
      .orderBy(desc(apiKeys.createdAt));

    console.log("[API /api/keys GET] Found", keys.length, "keys");
    return NextResponse.json({ keys });
  } catch (error) {
    console.error("[API /api/keys GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

// POST /api/keys - Create a new API key
export async function POST(request: NextRequest) {
  console.log("[API /api/keys POST] Creating key...");
  try {
    const user = await requireUser();
    console.log("[API /api/keys POST] User:", user.id);
    const body = await request.json();
    const { name } = body;
    console.log("[API /api/keys POST] Key name:", name);

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Generate new API key
    const { fullKey, keyPrefix, keyHash } = generateApiKey();

    // Get IP address for audit log
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ??
               request.headers.get("x-real-ip") ??
               null;

    // Insert the key and audit log in a transaction
    const [newKey] = await db
      .insert(apiKeys)
      .values({
        userId: user.id,
        name: name.trim(),
        keyPrefix,
        keyHash,
      })
      .returning();

    // Create audit log
    await db.insert(apiKeyAuditLogs).values({
      apiKeyId: newKey.id,
      userId: user.id,
      action: "created",
      ipAddress: ip,
    });

    // Return the full key (only time user will see it)
    console.log("[API /api/keys POST] Created key:", newKey.id);
    return NextResponse.json({
      key: {
        id: newKey.id,
        name: newKey.name,
        keyPrefix: newKey.keyPrefix,
        createdAt: newKey.createdAt,
        fullKey, // Only returned on creation
      },
    });
  } catch (error) {
    console.error("[API /api/keys POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}
