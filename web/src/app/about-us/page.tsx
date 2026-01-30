import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AboutUsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-[1080px] px-4 py-8 sm:py-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            About Us
          </h1>
          <div className="mt-8 space-y-6 text-muted-foreground">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit.
            </p>
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
              accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
              quae ab illo inventore veritatis et quasi architecto beatae vitae
              dicta sunt explicabo.
            </p>
          </div>

          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-bold">Business Opportunities</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nemo
                enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut
                fugit, sed quia consequuntur magni dolores eos qui ratione
                voluptatem sequi nesciunt.
              </p>
              <div className="rounded-lg border border-border bg-accent/50 p-6">
                <h3 className="mb-3 font-semibold text-foreground">
                  What we offer:
                </h3>
                <ul className="list-inside list-disc space-y-2">
                  <li>Lorem ipsum dolor sit amet</li>
                  <li>Consectetur adipiscing elit</li>
                  <li>Sed do eiusmod tempor</li>
                  <li>Ut labore et dolore magna</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-bold">Contact</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>Email: quochuy.dev@gmail.com</p>
              <p>GitHub: github.com/example/what-is</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
