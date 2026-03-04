import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${config.site.name} and our mission to provide AI-powered definition lookups for everyone.`,
  keywords: ["about", "team", "company", `${config.site.name} team`],
  openGraph: {
    title: `About Us | ${config.site.name}`,
    description: `Learn about ${config.site.name} and our mission to provide AI-powered definition lookups.`,
    url: `${config.site.url}/about-us`,
  },
  twitter: {
    card: "summary_large_image",
    title: `About Us | ${config.site.name}`,
    description: `Learn about ${config.site.name} and our mission to provide AI-powered definition lookups.`,
  },
};

export default function AboutUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
