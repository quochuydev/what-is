import { NextRequest, NextResponse } from "next/server";
import { sendNotification } from "@/lib/firebase";

// POST /api/firebase/send - Send a test notification
export async function POST(request: NextRequest) {
  try {
    const { token, title, body } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Device token is required" },
        { status: 400 }
      );
    }

    const messageId = await sendNotification(
      token,
      title || "Test Notification",
      body || "This is a test notification from what-is"
    );

    if (!messageId) {
      return NextResponse.json(
        { error: "Firebase is not configured" },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true, messageId });
  } catch (error) {
    console.error("[API /api/firebase/send] Error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
