import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "GunPow Arena",
  description:
    "Play GunPow Arena — a turn-based artillery battle game with chibi knights, destructible terrain, wind physics, and explosive fun!",
  keywords: [
    "gunpow",
    "artillery game",
    "turn-based",
    "battle",
    "playground",
    "canvas game",
  ],
  openGraph: {
    title: `GunPow Arena | ${config.site.name}`,
    description:
      "Turn-based artillery battle game with chibi knights, destructible terrain, and wind physics.",
    url: `${config.site.url}/playground`,
  },
  twitter: {
    card: "summary_large_image",
    title: `GunPow Arena | ${config.site.name}`,
    description:
      "Turn-based artillery battle game with chibi knights, destructible terrain, and wind physics.",
  },
};

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
