import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `${config.site.name} Terms of Service. Read our terms and conditions for using our AI-powered definition services.`,
  keywords: ["terms of service", "terms", "conditions", "legal"],
  openGraph: {
    title: `Terms of Service | ${config.site.name}`,
    description: `${config.site.name} Terms of Service. Read our terms and conditions.`,
    url: `${config.site.url}/terms`,
  },
  twitter: {
    card: "summary",
    title: `Terms of Service | ${config.site.name}`,
    description: `${config.site.name} Terms of Service. Read our terms and conditions.`,
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
