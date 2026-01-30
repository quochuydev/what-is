import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "VisionPipe3D Terms of Service. Read our terms and conditions for using our hand tracking APIs and services.",
  keywords: ["terms of service", "terms", "conditions", "legal"],
  openGraph: {
    title: "Terms of Service | VisionPipe3D",
    description:
      "VisionPipe3D Terms of Service. Read our terms and conditions.",
    url: "https://visionpipe3d.quochuy.dev/terms",
  },
  twitter: {
    card: "summary",
    title: "Terms of Service | VisionPipe3D",
    description:
      "VisionPipe3D Terms of Service. Read our terms and conditions.",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
