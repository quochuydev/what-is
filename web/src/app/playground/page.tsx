"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HandTrackingVideo } from "@/components/playground/HandTrackingVideo";
import { SettingsPanel } from "@/components/playground/SettingsPanel";
import { SecurityNotice } from "@/components/playground/SecurityNotice";
import { usePlaygroundSettings } from "@/components/playground/settings";
import { useState, useEffect, Suspense } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import Script from "next/script";

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
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { settings, updateSetting } = usePlaygroundSettings();

  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(0);
  const [scriptError, setScriptError] = useState(false);
  const [threeLoaded, setThreeLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [tokenAuth, setTokenAuth] = useState<{ valid: boolean; checked: boolean }>({
    valid: false,
    checked: false,
  });

  // Verify JWT token if present
  useEffect(() => {
    if (!token) {
      setTokenAuth({ valid: false, checked: true });
      return;
    }

    fetch("/api/playground/verify-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setTokenAuth({ valid: true, checked: true });
          setLoading(false);
          // Auto-start session for token-based auth (credit already deducted)
          setSessionStarted(true);
        } else {
          setTokenAuth({ valid: false, checked: true });
        }
      })
      .catch(() => {
        setTokenAuth({ valid: false, checked: true });
      });
  }, [token]);

  // Fetch credits when signed in (only if not using token auth)
  useEffect(() => {
    if (token && tokenAuth.valid) return; // Skip for token auth
    if (!authLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    fetch("/api/sessions")
      .then((res) => res.json())
      .then((data) => {
        setCredits(data.credits);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [authLoaded, isSignedIn, token, tokenAuth.valid]);

  const handleStartSession = async () => {
    if (credits === null || credits < 1 || sessionLoading) return;

    setSessionLoading(true);
    try {
      // Validate camera access first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      // Stop the stream immediately - we just needed to verify access
      stream.getTracks().forEach((track) => track.stop());

      // Camera granted, now call API
      const res = await fetch("/api/sessions", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setCredits(data.credits);
        setSessionStarted(true);
      } else {
        alert(data.error || "Failed to start session");
      }
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === "NotFoundError") {
          alert("Camera not found. Please connect a camera and try again.");
        } else if (err.name === "NotAllowedError") {
          alert("Camera access denied. Please allow camera access and try again.");
        } else {
          alert(`Camera error: ${err.message}`);
        }
      } else {
        alert("Failed to start session");
      }
    } finally {
      setSessionLoading(false);
    }
  };

  const handleStopSession = () => {
    setSessionStarted(false);
  };

  const allScriptsLoaded = scriptsLoaded >= 5;

  return (
    <div className="flex min-h-screen flex-col">
      {!expanded && <Header />}

      {/* Load external scripts - THREE must load before GLTFLoader */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        onLoad={() => {
          setThreeLoaded(true);
          setScriptsLoaded((n) => n + 1);
        }}
        onError={() => setScriptError(true)}
      />
      {/* GLTFLoader requires THREE to be defined, so only load after THREE is ready */}
      {threeLoaded && (
        <Script
          src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"
          onLoad={() => {
            // Attach GLTFLoader to window for consistency
            if ((window as any).THREE?.GLTFLoader) {
              (window as any).GLTFLoader = (window as any).THREE.GLTFLoader;
            }
            setScriptsLoaded((n) => n + 1);
          }}
          onError={() => setScriptError(true)}
        />
      )}
      <Script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"
        onLoad={() => setScriptsLoaded((n) => n + 1)}
        onError={() => setScriptError(true)}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
        onLoad={() => setScriptsLoaded((n) => n + 1)}
        onError={() => setScriptError(true)}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"
        onLoad={() => setScriptsLoaded((n) => n + 1)}
        onError={() => setScriptError(true)}
      />

      <main className="flex-1">
        <section className="mx-auto max-w-[1080px] px-4 py-8 sm:py-12">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Playground</h1>
            {tokenAuth.valid ? (
              <div className="rounded-lg bg-green-500/20 px-4 py-2 text-sm text-green-500">
                API Session Active
              </div>
            ) : isSignedIn ? (
              <div className="rounded-lg bg-accent px-4 py-2 text-sm">
                Credits:{" "}
                <span className="font-semibold">
                  {loading ? "..." : credits ?? 0}
                </span>
              </div>
            ) : null}
          </div>

          {!sessionStarted ? (
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-accent/50 p-8 text-center">
                <h2 className="text-xl font-semibold">Hand Tracking Demo</h2>
                <p className="mt-2 text-muted-foreground">
                  Control 3D text with your hand movements. Uses 1 credit per
                  session.
                </p>

                {/* Token auth: checking */}
                {token && !tokenAuth.checked ? (
                  <div className="mt-6 flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
                    <p className="text-muted-foreground">Verifying session token...</p>
                  </div>
                ) : /* Token auth: invalid */ token && tokenAuth.checked && !tokenAuth.valid ? (
                  <div className="mt-6">
                    <p className="text-red-500">
                      Invalid or expired session token. Please generate a new one.
                    </p>
                    <a
                      href="/docs/cloud/api-keys"
                      className="mt-4 inline-block rounded-lg bg-foreground px-6 py-3 font-medium text-background"
                    >
                      View API Documentation
                    </a>
                  </div>
                ) : /* Script loading error */ scriptError ? (
                  <div className="mt-6 flex flex-col items-center gap-3">
                    <p className="text-red-500">
                      Failed to load required scripts.
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="cursor-pointer rounded-lg bg-foreground px-6 py-3 font-medium text-background transition-opacity hover:opacity-90"
                    >
                      Refresh Page
                    </button>
                  </div>
                ) : /* Normal auth: loading */ !allScriptsLoaded || !authLoaded || loading ? (
                  <div className="mt-6 flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
                    <p className="text-muted-foreground">
                      {!authLoaded ? "Checking authentication..." : !allScriptsLoaded ? "Loading scripts..." : "Loading credits..."}
                    </p>
                  </div>
                ) : !isSignedIn ? (
                  <div className="mt-6">
                    <p className="mb-4 text-muted-foreground">
                      Sign in to start a session
                    </p>
                    <SignInButton mode="modal">
                      <button className="rounded-lg bg-foreground px-8 py-3 font-medium text-background transition-opacity hover:opacity-90 cursor-pointer">
                        Sign In to Start
                      </button>
                    </SignInButton>
                  </div>
                ) : credits === null || credits < 1 ? (
                  <div className="mt-6">
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
                  <button
                    onClick={handleStartSession}
                    disabled={sessionLoading}
                    className="mx-auto mt-6 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-foreground px-8 py-3 font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sessionLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Starting...
                      </>
                    ) : (
                      "Start Session (1 credit)"
                    )}
                  </button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border p-4">
                  <h3 className="font-semibold">Real-time Tracking</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    21 hand landmarks tracked at 30fps
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <h3 className="font-semibold">3D Visualization</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Interactive Three.js text follows your hand
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <h3 className="font-semibold">Browser-based</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Runs locally using WebGL acceleration
                  </p>
                </div>
              </div>

              <SecurityNotice />
            </div>
          ) : (
            <div className={`flex flex-col gap-4 ${expanded ? "" : "lg:flex-row"}`}>
              <HandTrackingVideo
                onStop={handleStopSession}
                settings={settings}
                expanded={expanded}
                onExpandToggle={() => setExpanded(!expanded)}
              />
              {!expanded && <SettingsPanel settings={settings} onUpdate={updateSetting} />}
            </div>
          )}
        </section>
      </main>
      {!expanded && <Footer />}
    </div>
  );
}
