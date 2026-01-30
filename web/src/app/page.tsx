import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThreeDMarquee } from "@/components/ThreeDMarquee";

// Placeholder images for the carousel (970x700 aspect ratio)
const carouselImages = [
  "https://placehold.co/970x700/1a1a2e/ffffff?text=AI+Definitions",
  "https://placehold.co/970x700/16213e/ffffff?text=Instant+Lookup",
  "https://placehold.co/970x700/0f3460/ffffff?text=Any+Topic",
  "https://placehold.co/970x700/533483/ffffff?text=Accurate+Results",
  "https://placehold.co/970x700/3b82f6/ffffff?text=Developer+API",
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-[1080px] px-4 py-8 text-center sm:py-12">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Definitions, instantly
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/playground"
              className="inline-flex h-12 items-center justify-center rounded-md bg-foreground px-8 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Try Demo
            </a>
            <a
              href="https://github.com/example/what-is"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-md border border-border px-8 text-sm font-medium transition-colors hover:bg-accent"
            >
              View on GitHub
            </a>
          </div>
        </section>

        {/* 3D Marquee Carousel */}
        <section className="mx-auto max-w-[1080px] px-4 py-8">
          <ThreeDMarquee images={carouselImages} />
        </section>

        {/* Stats Section */}
        <section className="mx-auto max-w-[1080px] px-4">
          <div className="grid grid-cols-2 gap-6 border-y border-border py-10 sm:py-12 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                1M+
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Definitions Served
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                &lt;1s
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Response Time
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                99.9%
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Uptime
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                MIT
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Open Source
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mx-auto max-w-[1080px] px-4 py-8 sm:py-12">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Built for developers
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad
            minim veniam, quis nostrud exercitation.
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border p-6 transition-colors hover:bg-accent">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-xl text-background">
                <span role="img" aria-hidden>
                  &#129504;
                </span>
              </div>
              <h3 className="text-lg font-semibold">AI-Powered</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt.
              </p>
            </div>

            <div className="rounded-xl border border-border p-6 transition-colors hover:bg-accent">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-xl text-background">
                <span role="img" aria-hidden>
                  &#9889;
                </span>
              </div>
              <h3 className="text-lg font-semibold">Lightning Fast</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim
                ad minim veniam.
              </p>
            </div>

            <div className="rounded-xl border border-border p-6 transition-colors hover:bg-accent">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-xl text-background">
                <span role="img" aria-hidden>
                  &#128736;
                </span>
              </div>
              <h3 className="text-lg font-semibold">Developer API</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quis
                nostrud exercitation ullamco.
              </p>
            </div>

            <div className="rounded-xl border border-border p-6 transition-colors hover:bg-accent">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-xl text-background">
                <span role="img" aria-hidden>
                  &#127757;
                </span>
              </div>
              <h3 className="text-lg font-semibold">Any Topic</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis
                aute irure dolor in reprehenderit.
              </p>
            </div>

            <div className="rounded-xl border border-border p-6 transition-colors hover:bg-accent">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-xl text-background">
                <span role="img" aria-hidden>
                  &#128274;
                </span>
              </div>
              <h3 className="text-lg font-semibold">Secure</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Excepteur sint occaecat cupidatat.
              </p>
            </div>

            <div className="rounded-xl border border-border p-6 transition-colors hover:bg-accent">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-xl text-background">
                <span role="img" aria-hidden>
                  &#128640;
                </span>
              </div>
              <h3 className="text-lg font-semibold">Scalable</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Non
                proident, sunt in culpa qui.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mx-auto max-w-[1080px] px-4">
          <div className="rounded-xl border border-border bg-accent py-12 text-center sm:py-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Start
              looking up definitions in seconds.
            </p>
            <div className="mt-8">
              <a
                href="/playground"
                className="inline-flex h-12 items-center justify-center rounded-md bg-foreground px-8 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Try Playground
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
