import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Latest news, tutorials, and updates from VisionPipe3D. Learn about hand tracking, Three.js integration, and gesture control.",
  keywords: [
    "blog",
    "news",
    "tutorials",
    "hand tracking news",
    "VisionPipe3D updates",
  ],
  openGraph: {
    title: "Blog | VisionPipe3D",
    description:
      "Latest news, tutorials, and updates from VisionPipe3D.",
    url: "https://visionpipe3d.quochuy.dev/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | VisionPipe3D",
    description:
      "Latest news, tutorials, and updates from VisionPipe3D.",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
