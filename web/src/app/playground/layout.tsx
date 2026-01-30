import type { Metadata } from "next";

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
    title: "Playground | what-is",
    description:
      "Look up definitions for any keyword using AI. Get instant, accurate definitions.",
    url: "https://example.com/playground",
  },
  twitter: {
    card: "summary_large_image",
    title: "Playground | what-is",
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
