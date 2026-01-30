import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cloud",
  description:
    "Access powerful hand tracking APIs from VisionPipe3D Cloud. Build gesture-controlled applications without managing infrastructure.",
  keywords: [
    "cloud API",
    "hand tracking API",
    "cloud service",
    "API access",
    "gesture API",
  ],
  openGraph: {
    title: "Cloud | VisionPipe3D",
    description:
      "Access powerful hand tracking APIs from VisionPipe3D Cloud.",
    url: "https://visionpipe3d.quochuy.dev/cloud",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cloud | VisionPipe3D",
    description:
      "Access powerful hand tracking APIs from VisionPipe3D Cloud.",
  },
};

export default function CloudLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
