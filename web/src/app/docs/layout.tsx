import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { source } from "@/lib/source";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "Documentation",
  description: `${config.site.name} documentation. Learn how to integrate AI-powered definition lookups into your applications.`,
  keywords: [
    "documentation",
    "docs",
    "API documentation",
    "integration guide",
  ],
  openGraph: {
    title: `Documentation | ${config.site.name}`,
    description: `${config.site.name} documentation. Learn how to integrate AI-powered definitions into your apps.`,
    url: `${config.site.url}/docs`,
  },
  twitter: {
    card: "summary_large_image",
    title: `Documentation | ${config.site.name}`,
    description: `${config.site.name} documentation. Learn how to integrate AI-powered definitions into your apps.`,
  },
};

export default function RootDocsLayout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: `${config.site.name} Docs`,
        url: "/docs",
      }}
      sidebar={{
        defaultOpenLevel: 1,
      }}
    >
      {children}
    </DocsLayout>
  );
}
