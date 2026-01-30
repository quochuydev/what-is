import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Station",
  description:
    "Your central hub for managing VisionPipe3D deployments, configurations, and monitoring analytics.",
  keywords: [
    "station",
    "deployment",
    "management",
    "configuration",
    "monitoring",
  ],
  openGraph: {
    title: "Station | VisionPipe3D",
    description:
      "Your central hub for managing VisionPipe3D deployments and configurations.",
    url: "https://visionpipe3d.quochuy.dev/station",
  },
  twitter: {
    card: "summary_large_image",
    title: "Station | VisionPipe3D",
    description:
      "Your central hub for managing VisionPipe3D deployments and configurations.",
  },
};

export default function StationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
