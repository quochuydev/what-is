import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "Station",
  description: `Your central hub for managing ${config.site.name} configurations and monitoring analytics.`,
  keywords: [
    "station",
    "deployment",
    "management",
    "configuration",
    "monitoring",
  ],
  openGraph: {
    title: `Station | ${config.site.name}`,
    description: `Your central hub for managing ${config.site.name} configurations.`,
    url: `${config.site.url}/station`,
  },
  twitter: {
    card: "summary_large_image",
    title: `Station | ${config.site.name}`,
    description: `Your central hub for managing ${config.site.name} configurations.`,
  },
};

export default function StationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
