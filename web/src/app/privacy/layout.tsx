import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `${config.site.name} Privacy Policy. Learn how we collect, use, and protect your information.`,
  keywords: ["privacy policy", "privacy", "data protection", "GDPR"],
  openGraph: {
    title: `Privacy Policy | ${config.site.name}`,
    description: `${config.site.name} Privacy Policy. Learn how we protect your data.`,
    url: `${config.site.url}/privacy`,
  },
  twitter: {
    card: "summary",
    title: `Privacy Policy | ${config.site.name}`,
    description: `${config.site.name} Privacy Policy. Learn how we protect your data.`,
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
