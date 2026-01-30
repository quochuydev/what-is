import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";

const creditPackages = [
  {
    name: "Starter",
    credits: 1,
    price: "$1",
    perCredit: "$1.00",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing.",
    highlighted: false,
  },
  {
    name: "Growth",
    credits: 6,
    price: "$5",
    perCredit: "$0.83",
    description: "Sed do eiusmod tempor incididunt ut labore.",
    highlighted: true,
  },
  {
    name: "Scale",
    credits: 30,
    price: "$20",
    perCredit: "$0.67",
    description: "Ut enim ad minim veniam, quis nostrud exercitation.",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-[1080px] px-4 py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. No
              subscriptions, no monthly fees.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {creditPackages.map((pkg) => (
              <div
                key={pkg.name}
                className={`rounded-2xl border p-8 ${
                  pkg.highlighted
                    ? "border-foreground bg-accent"
                    : "border-border"
                }`}
              >
                <h2 className="text-2xl font-bold">{pkg.name}</h2>
                <p className="mt-2 text-muted-foreground">{pkg.description}</p>

                <div className="mt-6">
                  <div className="text-4xl font-bold">
                    {pkg.credits.toLocaleString()}
                  </div>
                  <div className="text-muted-foreground">credits</div>
                </div>

                <div className="mt-4">
                  <span className="text-2xl font-bold">{pkg.price}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({pkg.perCredit}/credit)
                  </span>
                </div>

                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <li>1 credit = 1 definition lookup</li>
                  <li>Credits never expire</li>
                  <li>No monthly fees</li>
                </ul>

                <Link
                  href="/login?redirectTo=/c/cloud/billing"
                  className={`mt-8 block w-full cursor-pointer rounded-lg py-3 text-center font-medium transition-opacity hover:opacity-90 ${
                    pkg.highlighted
                      ? "bg-foreground text-background"
                      : "border border-border hover:bg-accent"
                  }`}
                >
                  Buy Now
                </Link>
              </div>
            ))}
          </div>

          {/* Enterprise Section */}
          <div className="mt-16 rounded-2xl border border-border p-8 text-center">
            <h2 className="text-2xl font-bold">Enterprise</h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Need
              volume discounts or custom SLAs?
            </p>
            <Link
              href="/about-us"
              className="mt-6 inline-block rounded-lg border border-border px-8 py-3 font-medium transition-colors hover:bg-accent"
            >
              Contact Sales
            </Link>
          </div>

          {/* Free Tier Info */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Lorem ipsum dolor sit amet. The{" "}
              <Link href="/playground" className="underline">
                Playground
              </Link>{" "}
              requires credits to use.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
