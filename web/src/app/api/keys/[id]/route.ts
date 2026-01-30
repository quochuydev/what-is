import { NextRequest, NextResponse } from "next/server";
import { db, apiKeys, apiKeyAuditLogs } from "@/db";
import { requireUser } from "@/lib/auth";
import { eq, and, isNull } from "drizzle-orm";

// DELETE /api/keys/[id] - Soft delete an API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    // Get IP address for audit log
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ??
      request.headers.get("x-real-ip") ??
      null;

    // Verify the key exists and belongs to user
    const existingKey = await db.query.apiKeys.findFirst({
      where: and(
        eq(apiKeys.id, id),
        eq(apiKeys.userId, user.id),
        isNull(apiKeys.deletedAt)
      ),
    });

    if (!existingKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    // Soft delete the key
    await db
      .update(apiKeys)
      .set({ deletedAt: new Date() })
      .where(eq(apiKeys.id, id));

    // Create audit log
    await db.insert(apiKeyAuditLogs).values({
      apiKeyId: id,
      userId: user.id,
      action: "deleted",
      ipAddress: ip,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}
