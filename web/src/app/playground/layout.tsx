import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "Try VisionPipe3D hand tracking demo. Control 3D text with your hand movements in real-time using MediaPipe and Three.js.",
  keywords: [
    "demo",
    "playground",
    "hand tracking demo",
    "try hand tracking",
    "interactive demo",
  ],
  openGraph: {
    title: "Playground | VisionPipe3D",
    description:
      "Try VisionPipe3D hand tracking demo. Control 3D text with your hand movements in real-time.",
    url: "https://visionpipe3d.quochuy.dev/playground",
  },
  twitter: {
    card: "summary_large_image",
    title: "Playground | VisionPipe3D",
    description:
      "Try VisionPipe3D hand tracking demo. Control 3D text with your hand movements in real-time.",
  },
};

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
