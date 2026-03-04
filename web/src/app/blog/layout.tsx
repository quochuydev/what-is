import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "Blog",
  description: `Latest news, tutorials, and updates from ${config.site.name}. Learn about AI-powered definitions and integration guides.`,
  keywords: [
    "blog",
    "news",
    "tutorials",
    `${config.site.name} updates`,
  ],
  openGraph: {
    title: `Blog | ${config.site.name}`,
    description: `Latest news, tutorials, and updates from ${config.site.name}.`,
    url: `${config.site.url}/blog`,
  },
  twitter: {
    card: "summary_large_image",
    title: `Blog | ${config.site.name}`,
    description: `Latest news, tutorials, and updates from ${config.site.name}.`,
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
