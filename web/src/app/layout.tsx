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
    default: "what-is - AI-Powered Definition Lookup",
    template: "%s | what-is",
  },
  description:
    "Get instant, AI-powered definitions for any keyword. Simple, fast, and accurate definitions at your fingertips.",
  keywords: [
    "definition",
    "AI",
    "lookup",
    "dictionary",
    "what is",
    "meaning",
    "explanation",
    "knowledge",
  ],
  metadataBase: new URL("https://example.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://example.com",
    title: "what-is - AI-Powered Definition Lookup",
    description:
      "Get instant, AI-powered definitions for any keyword. Simple, fast, and accurate definitions at your fingertips.",
    siteName: "what-is",
  },
  twitter: {
    card: "summary_large_image",
    title: "what-is - AI-Powered Definition Lookup",
    description:
      "Get instant, AI-powered definitions for any keyword. Simple, fast, and accurate definitions at your fingertips.",
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
                name: "what-is",
                url: "https://example.com",
                description:
                  "AI-powered definition lookup service. Get instant, accurate definitions for any keyword.",
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
                name: "what-is",
                url: "https://example.com",
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate:
                      "https://example.com/docs?q={search_term_string}",
                  },
                  "query-input": "required name=search_term_string",
                },
              }),
            }}
          />
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX');
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
