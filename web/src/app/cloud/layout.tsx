import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "Cloud",
  description: `Access powerful AI definition APIs from ${config.site.name} Cloud. Build applications with instant definition lookups.`,
  keywords: [
    "cloud API",
    "definition API",
    "cloud service",
    "API access",
  ],
  openGraph: {
    title: `Cloud | ${config.site.name}`,
    description: `Access powerful AI definition APIs from ${config.site.name} Cloud.`,
    url: `${config.site.url}/cloud`,
  },
  twitter: {
    card: "summary_large_image",
    title: `Cloud | ${config.site.name}`,
    description: `Access powerful AI definition APIs from ${config.site.name} Cloud.`,
  },
};

export default function CloudLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
