"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useState, useEffect, Suspense, FormEvent } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<PlaygroundLoading />}>
      <PlaygroundContent />
    </Suspense>
  );
}

function PlaygroundLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-[1080px] px-4 py-8 sm:py-12">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Playground</h1>
          </div>
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function PlaygroundContent() {
  const { isSignedIn, isLoaded: authLoaded } = useUser();

  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [definition, setDefinition] = useState<string | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<
    Array<{ keyword: string; definition: string }>
  >([]);

  // Fetch credits when signed in
  useEffect(() => {
    if (!authLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    fetch("/api/billing")
      .then((res) => res.json())
      .then((data) => {
        setCredits(data.credits);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [authLoaded, isSignedIn]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!keyword.trim() || queryLoading || !isSignedIn) return;

    setQueryLoading(true);
    setError(null);
    setDefinition(null);

    try {
      const res = await fetch("/api/playground/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setDefinition(data.definition);
        setCredits(data.credits);
        setHistory((prev) => [
          { keyword: data.keyword, definition: data.definition },
          ...prev.slice(0, 9),
        ]);
      } else {
        setError(data.error || "Failed to get definition");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-[1080px] px-4 py-8 sm:py-12">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Playground</h1>
            {isSignedIn && (
              <div className="rounded-lg bg-accent px-4 py-2 text-sm">
                Credits:{" "}
                <span className="font-semibold">
                  {loading ? "..." : credits ?? 0}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-accent/50 p-8">
              <h2 className="text-xl font-semibold">AI Definition Lookup</h2>
              <p className="mt-2 text-muted-foreground">
                Enter any keyword to get an AI-powered definition. Uses 1 credit
                per query.
              </p>

              {!authLoaded || loading ? (
                <div className="mt-6 flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
                  <p className="text-muted-foreground">
                    {!authLoaded
                      ? "Checking authentication..."
                      : "Loading credits..."}
                  </p>
                </div>
              ) : !isSignedIn ? (
                <div className="mt-6 text-center">
                  <p className="mb-4 text-muted-foreground">
                    Sign in to start looking up definitions
                  </p>
                  <SignInButton mode="modal">
                    <button className="cursor-pointer rounded-lg bg-foreground px-8 py-3 font-medium text-background transition-opacity hover:opacity-90">
                      Sign In to Start
                    </button>
                  </SignInButton>
                </div>
              ) : credits === null || credits < 1 ? (
                <div className="mt-6 text-center">
                  <p className="text-red-500">
                    Insufficient credits. Please purchase more.
                  </p>
                  <a
                    href="/c/cloud/billing"
                    className="mt-4 inline-block rounded-lg bg-foreground px-6 py-3 font-medium text-background"
                  >
                    Buy Credits
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="Enter a keyword (e.g., photosynthesis)"
                      className="flex-1 rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-foreground"
                      maxLength={100}
                      disabled={queryLoading}
                    />
                    <button
                      type="submit"
                      disabled={queryLoading || !keyword.trim()}
                      className="flex cursor-pointer items-center gap-2 rounded-lg bg-foreground px-6 py-3 font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {queryLoading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                          Looking up...
                        </>
                      ) : (
                        "Define"
                      )}
                    </button>
                  </div>
                </form>
              )}

              {error && (
                <div className="mt-4 rounded-lg bg-red-500/10 p-4 text-red-500">
                  {error}
                </div>
              )}

              {definition && (
                <div className="mt-6 rounded-lg border border-border bg-background p-6">
                  <h3 className="text-lg font-semibold capitalize">
                    {keyword}
                  </h3>
                  <p className="mt-2 text-muted-foreground">{definition}</p>
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-semibold">AI-Powered</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get accurate definitions using advanced language models
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-semibold">Instant Results</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Definitions generated in seconds
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-semibold">Any Topic</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  From science to art, get definitions for any keyword
                </p>
              </div>
            </div>

            {history.length > 0 && (
              <div className="rounded-xl border border-border p-6">
                <h3 className="mb-4 font-semibold">Recent Lookups</h3>
                <div className="space-y-3">
                  {history.map((item, i) => (
                    <div key={i} className="rounded-lg bg-accent/50 p-4">
                      <span className="font-medium capitalize">
                        {item.keyword}:
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {item.definition}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
