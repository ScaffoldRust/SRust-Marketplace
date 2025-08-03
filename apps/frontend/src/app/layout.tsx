import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { WebsiteStructuredData, OrganizationStructuredData } from "./components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://srust-marketplace.com"),
  title: "SRust Marketplace | Blockchain-Powered Digital Commerce",
  description: "Secure blockchain marketplace for digital goods, crypto merchandise, and collectibles. Buy and sell with confidence using our Rust-powered platform.",
  keywords: ["blockchain marketplace", "crypto merchandise", "NFT", "digital goods", "web3 commerce", "Rust", "secure marketplace", "cryptocurrency", "blockchain", "digital assets"],
  authors: [{ name: "SRust Team" }],
  creator: "SRust",
  publisher: "SRust",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en-US",
    },
  },
  openGraph: {
    title: "SRust Marketplace | Blockchain-Powered Digital Commerce",
    description: "Secure blockchain marketplace for digital goods, crypto merchandise, and collectibles. Buy and sell with confidence using our Rust-powered platform.",
    url: "/",
    siteName: "SRust Marketplace",
    images: [
      {
        url: "/icons/Scaffold_Rust_Logo.jpg",
        width: 1200,
        height: 630,
        alt: "SRust Marketplace Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SRust Marketplace | Blockchain-Powered Digital Commerce",
    description: "Secure blockchain marketplace for digital goods, crypto merchandise, and collectibles.",
    images: ["/icons/Scaffold_Rust_Logo.jpg"],
    creator: "@srustmarketplace",
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    // Add verification codes when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  category: "ecommerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://srust-marketplace.com';
  
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href={siteUrl} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <WebsiteStructuredData siteUrl={siteUrl} />
        <OrganizationStructuredData />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <div className="pt-16 md:pt-24">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
