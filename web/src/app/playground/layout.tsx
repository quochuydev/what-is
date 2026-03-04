import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "Look up definitions for any keyword using AI. Get instant, accurate definitions powered by advanced language models.",
  keywords: [
    "definition",
    "playground",
    "AI definition",
    "lookup",
    "dictionary",
    "what is",
  ],
  openGraph: {
    title: `Playground | ${config.site.name}`,
    description:
      "Look up definitions for any keyword using AI. Get instant, accurate definitions.",
    url: `${config.site.url}/playground`,
  },
  twitter: {
    card: "summary_large_image",
    title: `Playground | ${config.site.name}`,
    description:
      "Look up definitions for any keyword using AI. Get instant, accurate definitions.",
  },
};

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
