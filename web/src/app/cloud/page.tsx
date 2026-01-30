import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export default function CloudLandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-[1080px] px-4 py-8 text-center sm:py-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            VisionPipe3D Cloud
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Access powerful hand tracking APIs from anywhere. Build
            gesture-controlled applications without managing infrastructure.
          </p>

          <div className="mt-10">
            <Link
              href="/c/cloud/api-keys"
              className="inline-flex h-12 items-center justify-center rounded-md bg-foreground px-8 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-[1080px] px-4 py-16">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-xl text-background">
                  &#9889;
                </div>
                <h3 className="font-semibold">Low Latency</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Edge-optimized endpoints for real-time hand tracking with
                  minimal delay.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-xl text-background">
                  &#128272;
                </div>
                <h3 className="font-semibold">Secure by Default</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enterprise-grade security with API key authentication and rate
                  limiting.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-xl text-background">
                  &#128200;
                </div>
                <h3 className="font-semibold">Scale Effortlessly</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Auto-scaling infrastructure that grows with your application.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
