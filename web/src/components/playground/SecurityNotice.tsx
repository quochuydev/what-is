"use client";

interface SecurityNoticeProps {
  compact?: boolean;
}

export function SecurityNotice({ compact = false }: SecurityNoticeProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-center gap-2 text-xs text-green-600">
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <span>Video processed locally - never sent to servers</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
      <div className="flex items-start gap-3">
        <svg
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <div>
          <h3 className="font-semibold text-green-500">
            Your Privacy is Protected
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            All video processing happens directly in your browser
            using client-side code. Your webcam feed is never sent to
            our servers or stored anywhere. The hand tracking runs
            entirely on your device using WebGL acceleration.
          </p>
        </div>
      </div>
    </div>
  );
}
