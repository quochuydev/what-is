import { NextRequest, NextResponse } from "next/server";
import { db, usageDaily, apiKeys, users } from "@/db";
import { requireUser } from "@/lib/auth";
import { eq, and, gte, lte, sql, desc, isNull } from "drizzle-orm";

// GET /api/usage - Get usage statistics for the current user
export async function GET(request: NextRequest) {
  console.log("[API /api/usage GET] Fetching usage...");
  try {
    const user = await requireUser();
    console.log("[API /api/usage GET] User:", user.id);

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") ?? "30", 10);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    // Get daily usage aggregated
    const dailyUsage = await db
      .select({
        date: usageDaily.date,
        requestCount: sql<number>`sum(${usageDaily.requestCount})::int`,
      })
      .from(usageDaily)
      .where(
        and(
          eq(usageDaily.userId, user.id),
          gte(usageDaily.date, startDateStr),
          lte(usageDaily.date, endDateStr)
        )
      )
      .groupBy(usageDaily.date)
      .orderBy(usageDaily.date);

    // Get total usage for the period
    const [totals] = await db
      .select({
        totalRequests: sql<number>`coalesce(sum(${usageDaily.requestCount}), 0)::int`,
      })
      .from(usageDaily)
      .where(
        and(
          eq(usageDaily.userId, user.id),
          gte(usageDaily.date, startDateStr),
          lte(usageDaily.date, endDateStr)
        )
      );

    // Get usage per API key
    const usageByKey = await db
      .select({
        apiKeyId: usageDaily.apiKeyId,
        keyName: apiKeys.name,
        keyPrefix: apiKeys.keyPrefix,
        totalRequests: sql<number>`sum(${usageDaily.requestCount})::int`,
      })
      .from(usageDaily)
      .innerJoin(apiKeys, eq(usageDaily.apiKeyId, apiKeys.id))
      .where(
        and(
          eq(usageDaily.userId, user.id),
          gte(usageDaily.date, startDateStr),
          lte(usageDaily.date, endDateStr),
          isNull(apiKeys.deletedAt)
        )
      )
      .groupBy(usageDaily.apiKeyId, apiKeys.name, apiKeys.keyPrefix)
      .orderBy(desc(sql`sum(${usageDaily.requestCount})`));

    // Get current credits
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      columns: { credits: true },
    });

    console.log("[API /api/usage GET] Total requests:", totals?.totalRequests, "Daily entries:", dailyUsage.length);
    return NextResponse.json({
      period: {
        startDate: startDateStr,
        endDate: endDateStr,
        days,
      },
      totalRequests: totals?.totalRequests ?? 0,
      creditsRemaining: currentUser?.credits ?? 0,
      dailyUsage,
      usageByKey,
    });
  } catch (error) {
    console.error("[API /api/usage GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage data" },
      { status: 500 }
    );
  }
}
