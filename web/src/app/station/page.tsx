import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function StationPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-[1080px] px-4 py-8 sm:py-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Station
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Your central hub for managing VisionPipe3D deployments and
            configurations.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border p-6">
              <h3 className="font-semibold">Deployment Status</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Monitor the health and status of your VisionPipe3D instances.
              </p>
            </div>
            <div className="rounded-xl border border-border p-6">
              <h3 className="font-semibold">Configuration</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Manage tracking parameters and gesture recognition settings.
              </p>
            </div>
            <div className="rounded-xl border border-border p-6">
              <h3 className="font-semibold">Analytics</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                View detailed analytics and performance metrics.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
