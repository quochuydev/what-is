import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center">
        <div className="px-4 text-center">
          <h1 className="text-8xl font-bold">404</h1>
          <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="rounded-lg bg-foreground px-6 py-3 font-medium text-background transition-opacity hover:opacity-90"
            >
              Go Home
            </Link>
            <Link
              href="/docs"
              className="rounded-lg border border-border px-6 py-3 font-medium transition-colors hover:bg-accent"
            >
              View Docs
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
