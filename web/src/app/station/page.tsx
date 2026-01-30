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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border p-6">
              <h3 className="font-semibold">Lorem Ipsum</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                tempor incididunt.
              </p>
            </div>
            <div className="rounded-xl border border-border p-6">
              <h3 className="font-semibold">Consectetur</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore.
              </p>
            </div>
            <div className="rounded-xl border border-border p-6">
              <h3 className="font-semibold">Adipiscing</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Elit sed do eiusmod tempor incididunt ut labore et dolore magna
                aliqua.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
