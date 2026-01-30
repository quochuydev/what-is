import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "VisionPipe3D Privacy Policy. Learn how we collect, use, and protect your information including camera and video data.",
  keywords: ["privacy policy", "privacy", "data protection", "GDPR"],
  openGraph: {
    title: "Privacy Policy | VisionPipe3D",
    description:
      "VisionPipe3D Privacy Policy. Learn how we protect your data.",
    url: "https://visionpipe3d.quochuy.dev/privacy",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | VisionPipe3D",
    description:
      "VisionPipe3D Privacy Policy. Learn how we protect your data.",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
