import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <article className="mx-auto max-w-[1080px] px-4 py-8 sm:py-12">
          <h1 className="text-4xl font-bold tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-4 text-muted-foreground">
            Last updated: January 2024
          </p>

          <div className="mt-12 space-y-8">
            <section>
              <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
              <p className="mt-3 text-muted-foreground">
                By accessing or using VisionPipe3D services, you agree to be
                bound by these Terms of Service. If you do not agree to these
                terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">
                2. Description of Service
              </h2>
              <p className="mt-3 text-muted-foreground">
                VisionPipe3D provides hand tracking and gesture recognition APIs
                and tools for developers. Our services include cloud-based APIs,
                SDKs, and documentation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">3. User Accounts</h2>
              <p className="mt-3 text-muted-foreground">
                You are responsible for maintaining the confidentiality of your
                account and API keys. You agree to notify us immediately of any
                unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">4. Acceptable Use</h2>
              <p className="mt-3 text-muted-foreground">
                You agree not to use VisionPipe3D services for any unlawful
                purpose or in any way that could damage, disable, or impair our
                services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">
                5. Intellectual Property
              </h2>
              <p className="mt-3 text-muted-foreground">
                VisionPipe3D and its original content, features, and
                functionality are owned by VisionPipe3D and are protected by
                international copyright, trademark, and other intellectual
                property laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">
                6. Limitation of Liability
              </h2>
              <p className="mt-3 text-muted-foreground">
                VisionPipe3D shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages resulting from your
                use or inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">7. Changes to Terms</h2>
              <p className="mt-3 text-muted-foreground">
                We reserve the right to modify these terms at any time. We will
                notify users of any material changes via email or through our
                website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">8. Contact</h2>
              <p className="mt-3 text-muted-foreground">
                For questions about these Terms, please contact us at
                quochuy.dev@gmail.com.
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
