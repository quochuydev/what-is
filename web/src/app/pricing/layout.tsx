import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for what-is. Pay only for what you use with our credit-based system.",
  keywords: ["pricing", "plans", "API pricing", "credits"],
  openGraph: {
    title: "Pricing | what-is",
    description:
      "Simple, transparent pricing for what-is. Pay only for what you use.",
    url: "https://example.com/pricing",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | what-is",
    description:
      "Simple, transparent pricing for what-is. Pay only for what you use.",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
