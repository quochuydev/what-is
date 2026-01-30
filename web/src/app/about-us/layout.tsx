import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about VisionPipe3D and our mission to democratize hand tracking technology for the next generation of touchless interfaces.",
  keywords: [
    "about",
    "team",
    "company",
    "VisionPipe3D team",
    "gesture control company",
  ],
  openGraph: {
    title: "About Us | VisionPipe3D",
    description:
      "Learn about VisionPipe3D and our mission to democratize hand tracking technology.",
    url: "https://visionpipe3d.quochuy.dev/about-us",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | VisionPipe3D",
    description:
      "Learn about VisionPipe3D and our mission to democratize hand tracking technology.",
  },
};

export default function AboutUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
