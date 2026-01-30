import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <article className="mx-auto max-w-[1080px] px-4 py-8 sm:py-12">
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-4 text-muted-foreground">
            Last updated: January 2024
          </p>

          <div className="mt-12 space-y-8">
            <section>
              <h2 className="text-xl font-semibold">
                1. Information We Collect
              </h2>
              <p className="mt-3 text-muted-foreground">
                We collect information you provide directly to us, such as when
                you create an account, use our services, or contact us for
                support. This may include your name, email address, and payment
                information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">
                2. Camera and Video Data
              </h2>
              <p className="mt-3 text-muted-foreground">
                Our hand tracking technology processes video from your
                device&apos;s camera. This processing happens locally in your
                browser. We do not store, transmit, or access your camera feed
                or video data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">
                3. How We Use Information
              </h2>
              <p className="mt-3 text-muted-foreground">
                We use the information we collect to provide, maintain, and
                improve our services, process transactions, send technical
                notices and support messages, and respond to your requests.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">4. Information Sharing</h2>
              <p className="mt-3 text-muted-foreground">
                We do not sell, trade, or otherwise transfer your personal
                information to third parties. We may share information with
                service providers who assist us in operating our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">5. Data Security</h2>
              <p className="mt-3 text-muted-foreground">
                We implement appropriate technical and organizational measures
                to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">6. Cookies</h2>
              <p className="mt-3 text-muted-foreground">
                We use cookies and similar tracking technologies to track
                activity on our website and store certain information. You can
                instruct your browser to refuse all cookies or indicate when a
                cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">7. Your Rights</h2>
              <p className="mt-3 text-muted-foreground">
                You have the right to access, correct, or delete your personal
                information. You may also request a copy of your data or ask us
                to restrict processing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">8. Contact Us</h2>
              <p className="mt-3 text-muted-foreground">
                If you have questions about this Privacy Policy, please contact
                us at quochuy.dev@gmail.com.
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
