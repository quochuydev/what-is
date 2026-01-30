"use client";

import { useState, useEffect } from "react";

interface DailyUsage {
  date: string;
  requestCount: number;
}

interface UsageByKey {
  apiKeyId: string;
  keyName: string;
  keyPrefix: string;
  totalRequests: number;
}

interface UsageData {
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  totalRequests: number;
  creditsRemaining: number;
  dailyUsage: DailyUsage[];
  usageByKey: UsageByKey[];
}

export default function UsagePage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchUsage = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/usage?days=${days}`);
        if (!res.ok) throw new Error("Failed to fetch usage");
        const data = await res.json();
        setUsage(data);
      } catch {
        setError("Failed to load usage data");
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [days]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !usage) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-red-500">{error || "Failed to load data"}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usage Dashboard</h1>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border p-4">
          <div className="text-sm text-muted-foreground">Total API Calls</div>
          <div className="mt-1 text-2xl font-bold">
            {usage.totalRequests.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border border-border p-4">
          <div className="text-sm text-muted-foreground">Credits Remaining</div>
          <div className="mt-1 text-2xl font-bold">
            {usage.creditsRemaining.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border border-border p-4">
          <div className="text-sm text-muted-foreground">Active API Keys</div>
          <div className="mt-1 text-2xl font-bold">{usage.usageByKey.length}</div>
        </div>
      </div>

      {/* Usage by API Key */}
      {usage.usageByKey.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Usage by API Key</h2>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full">
              <thead className="bg-accent">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Key</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Requests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usage.usageByKey.map((key) => (
                  <tr key={key.apiKeyId}>
                    <td className="px-4 py-3 font-mono text-sm text-muted-foreground">
                      {key.keyPrefix}
                    </td>
                    <td className="px-4 py-3 text-sm">{key.keyName}</td>
                    <td className="px-4 py-3 text-right text-sm">
                      {key.totalRequests.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Daily Usage Table */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Daily Usage</h2>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full">
            <thead className="bg-accent">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-right text-sm font-medium">API Calls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {usage.dailyUsage.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                    No usage data for this period.
                  </td>
                </tr>
              ) : (
                usage.dailyUsage.map((day) => (
                  <tr key={day.date}>
                    <td className="px-4 py-3 text-sm">{formatDate(day.date)}</td>
                    <td className="px-4 py-3 text-right text-sm">
                      {day.requestCount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
