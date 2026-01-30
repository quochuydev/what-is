import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { source } from "@/lib/source";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "VisionPipe3D documentation. Learn how to integrate hand tracking and gesture control into your applications.",
  keywords: [
    "documentation",
    "docs",
    "API documentation",
    "hand tracking docs",
    "integration guide",
  ],
  openGraph: {
    title: "Documentation | VisionPipe3D",
    description:
      "VisionPipe3D documentation. Learn how to integrate hand tracking into your apps.",
    url: "https://visionpipe3d.quochuy.dev/docs",
  },
  twitter: {
    card: "summary_large_image",
    title: "Documentation | VisionPipe3D",
    description:
      "VisionPipe3D documentation. Learn how to integrate hand tracking into your apps.",
  },
};

export default function RootDocsLayout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: "VisionPipe Docs",
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
