import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for VisionPipe3D. Choose between Standard and Enterprise plans for hand tracking API access.",
  keywords: ["pricing", "plans", "API pricing", "hand tracking pricing"],
  openGraph: {
    title: "Pricing | VisionPipe3D",
    description:
      "Simple, transparent pricing for VisionPipe3D. Choose between Standard and Enterprise plans.",
    url: "https://visionpipe3d.quochuy.dev/pricing",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | VisionPipe3D",
    description:
      "Simple, transparent pricing for VisionPipe3D. Choose between Standard and Enterprise plans.",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
