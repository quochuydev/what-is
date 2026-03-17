import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Firebase Notifications",
  description: "Test Firebase Cloud Messaging notifications.",
};

export default function FirebaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
