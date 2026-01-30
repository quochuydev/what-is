import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db, users, creditTransactions } from "@/db";
import { config } from "@/lib/config";
import { eq, sql } from "drizzle-orm";
import OpenAI from "openai";

// POST /api/playground/query - Get AI definition for a keyword
export async function POST(request: NextRequest) {
  console.log("[API /api/playground/query POST] Processing query...");
  try {
    const user = await requireUser();
    console.log("[API /api/playground/query POST] User:", user.id);

    const body = await request.json();
    const { keyword } = body;

    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 }
      );
    }

    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword.length === 0 || trimmedKeyword.length > 100) {
      return NextResponse.json(
        { error: "Keyword must be between 1 and 100 characters" },
        { status: 400 }
      );
    }

    // Check user credits
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      columns: { credits: true },
    });

    if (!currentUser || currentUser.credits < 1) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    // Call OpenAI-compatible API
    const openai = new OpenAI({
      apiKey: config.llm.apiKey,
      baseURL: config.llm.baseUrl,
    });

    const completion = await openai.chat.completions.create({
      model: config.llm.model,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that provides clear, accurate definitions. Keep responses concise (2-3 sentences). Do not include the word itself in the definition. Focus on the most common meaning.",
        },
        {
          role: "user",
          content: `Define "${trimmedKeyword}" concisely in 2-3 sentences.`,
        },
      ],
      max_tokens: 150,
      temperature: 0.3,
    });

    const definition = completion.choices[0]?.message?.content?.trim();

    if (!definition) {
      return NextResponse.json(
        { error: "Failed to generate definition" },
        { status: 500 }
      );
    }

    // Deduct 1 credit
    await db
      .update(users)
      .set({
        credits: sql`${users.credits} - 1`,
      })
      .where(eq(users.id, user.id));

    // Record transaction
    await db.insert(creditTransactions).values({
      userId: user.id,
      amount: -1,
      type: "usage",
      description: `Definition lookup: ${trimmedKeyword}`,
    });

    // Get updated credits
    const updatedUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      columns: { credits: true },
    });

    console.log(
      "[API /api/playground/query POST] Definition generated for:",
      trimmedKeyword
    );

    return NextResponse.json({
      keyword: trimmedKeyword,
      definition,
      credits: updatedUser?.credits ?? 0,
    });
  } catch (error) {
    console.error("[API /api/playground/query POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
}
