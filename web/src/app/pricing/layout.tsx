import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for what-is. Pay only for what you use with our credit-based system.",
  keywords: ["pricing", "plans", "API pricing", "credits"],
  openGraph: {
    title: `Pricing | ${config.site.name}`,
    description:
      "Simple, transparent pricing for what-is. Pay only for what you use.",
    url: `${config.site.url}/pricing`,
  },
  twitter: {
    card: "summary_large_image",
    title: `Pricing | ${config.site.name}`,
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
