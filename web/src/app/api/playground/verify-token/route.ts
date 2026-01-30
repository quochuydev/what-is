import { NextRequest, NextResponse } from "next/server";
import { verifyPlaygroundToken } from "@/lib/jwt";

// POST /api/playground/verify-token - Verify a playground JWT token
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { valid: false, error: "Token required" },
        { status: 400 }
      );
    }

    const payload = await verifyPlaygroundToken(token);

    if (!payload) {
      return NextResponse.json(
        { valid: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      userId: payload.userId,
      apiKeyId: payload.apiKeyId,
    });
  } catch (error) {
    console.error("[API /playground/verify-token] Error:", error);
    return NextResponse.json(
      { valid: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
