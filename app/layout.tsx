import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const heading = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading-family",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans-family",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ZAVÉLIA | Elegance For Every You",
    template: "%s | ZAVÉLIA",
  },
  description:
    "ZAVÉLIA — premium jewellery and fashion accessories for women, men, girls, and boys. Elegance For Every You.",
  openGraph: {
    title: "ZAVÉLIA | Elegance For Every You",
    description:
      "Discover ornaments, jewellery, and fashion accessories crafted for every style.",
    url: siteUrl,
    siteName: "ZAVÉLIA",
    images: [{ url: "/brand/zavelia-logo.png", width: 1200, height: 400 }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZAVÉLIA",
    description: "Elegance For Every You",
    images: ["/brand/zavelia-logo.png"],
  },
  icons: {
    icon: "/brand/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${heading.variable} ${sans.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">{children}</body>
    </html>
  );
}
