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
              VisionPipe3D is building the future of human-computer interaction.
              We believe that gesture control will transform how we interact
              with digital content.
            </p>
            <p>
              Our team combines expertise in computer vision, machine learning,
              and 3D graphics to create tools that make gesture-controlled
              experiences accessible to every developer.
            </p>
            <p>
              Founded in 2026, we&apos;re on a mission to democratize hand
              tracking technology and enable the next generation of touchless
              interfaces.
            </p>
          </div>

          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-bold">Business Opportunities</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                We&apos;re open to business cooperation and product development
                partnerships. Whether you&apos;re looking to integrate hand tracking
                into your existing products, develop custom solutions, or explore
                acquisition opportunities, we&apos;d love to hear from you.
              </p>
              <div className="rounded-lg border border-border bg-accent/50 p-6">
                <h3 className="mb-3 font-semibold text-foreground">
                  What we offer:
                </h3>
                <ul className="list-inside list-disc space-y-2">
                  <li>Technology licensing and white-label solutions</li>
                  <li>Custom product development and integration</li>
                  <li>Business partnerships and joint ventures</li>
                  <li>Full business acquisition opportunities</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-bold">Contact</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>Email: quochuy.dev@gmail.com</p>
              <p>GitHub: github.com/quochuydev/visionpipe3d</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
