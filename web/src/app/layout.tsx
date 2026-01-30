import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "VisionPipe3D - Hand Tracking 3D Control",
    template: "%s | VisionPipe3D",
  },
  description:
    "Real-time hand tracking meets Three.js. Build gesture-controlled 3D experiences that respond to natural hand movements.",
  keywords: [
    "hand tracking",
    "MediaPipe",
    "Three.js",
    "3D",
    "gesture control",
    "WebGL",
    "computer vision",
    "real-time tracking",
  ],
  metadataBase: new URL("https://visionpipe3d.quochuy.dev"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://visionpipe3d.quochuy.dev",
    title: "VisionPipe3D - Hand Tracking 3D Control",
    description:
      "Real-time hand tracking meets Three.js. Build gesture-controlled 3D experiences that respond to natural hand movements.",
    siteName: "VisionPipe3D",
  },
  twitter: {
    card: "summary_large_image",
    title: "VisionPipe3D - Hand Tracking 3D Control",
    description:
      "Real-time hand tracking meets Three.js. Build gesture-controlled 3D experiences that respond to natural hand movements.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "VisionPipe3D",
                url: "https://visionpipe3d.quochuy.dev",
                description:
                  "Real-time hand tracking meets Three.js. Build gesture-controlled 3D experiences.",
                sameAs: [],
              }),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "VisionPipe3D",
                url: "https://visionpipe3d.quochuy.dev",
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate:
                      "https://visionpipe3d.quochuy.dev/docs?q={search_term_string}",
                  },
                  "query-input": "required name=search_term_string",
                },
              }),
            }}
          />
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-EB77BKT734"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-EB77BKT734');
            `}
          </Script>
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <RootProvider>{children}</RootProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
