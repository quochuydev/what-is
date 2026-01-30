import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThreeDMarquee } from "@/components/ThreeDMarquee";

// Placeholder images for the carousel (970x700 aspect ratio)
const carouselImages = [
  "https://placehold.co/970x700/1a1a2e/ffffff?text=Hand+Tracking",
  "https://placehold.co/970x700/16213e/ffffff?text=Gesture+Recognition",
  "https://placehold.co/970x700/0f3460/ffffff?text=Multi-Hand+Tracking",
  "https://placehold.co/970x700/533483/ffffff?text=3D+Manipulation",
  "https://placehold.co/970x700/e94560/ffffff?text=Interactive+UI",
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-[1080px] px-4 py-8 text-center sm:py-12">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Control 3D with your hands
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Real-time hand tracking meets Three.js. Build gesture-controlled 3D
            experiences that respond to natural hand movements.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/playground"
              className="inline-flex h-12 items-center justify-center rounded-md bg-foreground px-8 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Try Demo
            </a>
            <a
              href="https://github.com/quochuydev/visionpipe3d"
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
                21
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Hand Landmarks
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                60fps
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Real-time Tracking
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                3D
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Spatial Control
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
            Everything you need to add gesture control to your 3D applications.
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border p-6 transition-colors hover:bg-accent">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-xl text-background">
                <span role="img" aria-hidden>
                  &#9995;
                </span>
              </div>
              <h3 className="text-lg font-semibold">Hand Tracking</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Precise 21-point hand landmark detection powered by MediaPipe.
                Track fingers, palm, and wrist in real-time.
              </p>
            </div>

            <div className="rounded-xl border border-border p-6 transition-colors hover:bg-accent">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-xl text-background">
                <span role="img" aria-hidden>
                  &#127922;
                </span>
              </div>
              <h3 className="text-lg font-semibold">3D Integration</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Seamless Three.js integration. Map hand movements to 3D object
                transformations with minimal code.
              </p>
            </div>

            <div className="rounded-xl border border-border p-6 transition-colors hover:bg-accent">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-xl text-background">
                <span role="img" aria-hidden>
                  &#9889;
                </span>
              </div>
              <h3 className="text-lg font-semibold">Zero Config</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Works in any modern browser. No installation required. Just open
                and allow camera access.
              </p>
            </div>

            <div className="rounded-xl border border-border p-6 transition-colors hover:bg-accent">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-xl text-background">
                <span role="img" aria-hidden>
                  &#128260;
                </span>
              </div>
              <h3 className="text-lg font-semibold">Gesture Recognition</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Detect gestures like pinch, grab, point, and wave. Build
                intuitive touchless interfaces.
              </p>
            </div>

            <div className="rounded-xl border border-border p-6 transition-colors hover:bg-accent">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-xl text-background">
                <span role="img" aria-hidden>
                  &#128736;
                </span>
              </div>
              <h3 className="text-lg font-semibold">Developer Friendly</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Clean API, TypeScript support, and comprehensive documentation.
                Get started in minutes.
              </p>
            </div>

            <div className="rounded-xl border border-border p-6 transition-colors hover:bg-accent">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-xl text-background">
                <span role="img" aria-hidden>
                  &#128640;
                </span>
              </div>
              <h3 className="text-lg font-semibold">Production Ready</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Optimized for performance. Deploy anywhere with HTTPS for secure
                camera access.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mx-auto max-w-[1080px] px-4">
          <div className="rounded-xl border border-border bg-accent py-12 text-center sm:py-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to build?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Start controlling 3D objects with your hands in minutes. No signup
              required.
            </p>
            <div className="mt-8">
              <a
                href="/playground"
                className="inline-flex h-12 items-center justify-center rounded-md bg-foreground px-8 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Launch Demo
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
