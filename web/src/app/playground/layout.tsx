import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "2D Battle Arena",
  description:
    "Play a 2D multiplayer fighting game — battle royale style. Fight locally against AI bots or connect via WebSocket for online multiplayer.",
  keywords: [
    "fighting game",
    "2d game",
    "battle arena",
    "multiplayer",
    "playground",
    "browser game",
  ],
  openGraph: {
    title: `2D Battle Arena | ${config.site.name}`,
    description:
      "Free-for-all 2D fighting game. Play locally or online via WebSocket.",
    url: `${config.site.url}/playground`,
  },
  twitter: {
    card: "summary_large_image",
    title: `2D Battle Arena | ${config.site.name}`,
    description:
      "Free-for-all 2D fighting game. Play locally or online via WebSocket.",
  },
};

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
