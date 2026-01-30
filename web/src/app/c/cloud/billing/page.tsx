"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  currency: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  createdAt: string;
}

interface BillingData {
  credits: number;
  transactions: Transaction[];
  packages: CreditPackage[];
}

function BillingContent() {
  const searchParams = useSearchParams();
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowSuccess(true);
      // Remove query params from URL
      window.history.replaceState({}, "", "/c/cloud/billing");
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const res = await fetch("/api/billing");
        if (!res.ok) throw new Error("Failed to fetch billing");
        const data = await res.json();
        setBilling(data);
      } catch {
        setError("Failed to load billing information");
      } finally {
        setLoading(false);
      }
    };

    fetchBilling();
  }, []);

  const handlePurchase = async (packageId: string) => {
    setPurchasing(packageId);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });

      if (!res.ok) throw new Error("Failed to create checkout session");

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Failed to start checkout");
      setPurchasing(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !billing) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-red-500">{error || "Failed to load data"}</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Billing & Credits</h1>

      {showSuccess && (
        <div className="mb-6 rounded-lg bg-green-500/10 p-4 text-green-600">
          Payment successful! Your credits have been added to your account.
          <button
            onClick={() => setShowSuccess(false)}
            className="ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Current Credits */}
      <div className="mb-8 rounded-xl border border-border p-6">
        <h2 className="mb-2 text-lg font-semibold">Available Credits</h2>
        <div className="text-4xl font-bold">{billing.credits.toLocaleString()}</div>
        <p className="mt-1 text-sm text-muted-foreground">
          1 credit = 1 API call
        </p>
      </div>

      {/* Buy Credits */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Buy Credits</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {billing.packages.map((pkg) => (
            <div
              key={pkg.id}
              className="rounded-xl border border-border p-6 transition-colors hover:border-foreground"
            >
              <div className="text-2xl font-bold">
                {pkg.credits.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">credits</div>
              <div className="mt-4 text-xl font-semibold">
                {formatCurrency(pkg.price, pkg.currency)}
              </div>
              <button
                onClick={() => handlePurchase(pkg.id)}
                disabled={purchasing === pkg.id}
                className="mt-4 w-full cursor-pointer rounded-lg bg-foreground py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {purchasing === pkg.id ? "Redirecting..." : "Buy Now"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-xl border border-border">
        <div className="border-b border-border p-4">
          <h2 className="font-semibold">Transaction History</h2>
        </div>
        <table className="w-full">
          <thead className="bg-accent">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Credits</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {billing.transactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No transactions yet.
                </td>
              </tr>
            ) : (
              billing.transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(tx.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {tx.description || tx.type}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        tx.type === "purchase"
                          ? "bg-green-500/10 text-green-500"
                          : tx.type === "usage"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-gray-500/10 text-gray-500"
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right text-sm font-medium ${
                      tx.amount > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}
