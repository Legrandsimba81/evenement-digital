import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButtonFloating from "@/components/ui/BackButtonFloating";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://evenement-digital.vercel.app"),
  title: {
    default: "Octavia - Gestion d'événements",
    template: "%s | Octavia",
  },
  description:
    "Créez, gérez et partagez vos invitations en ligne. Simple, rapide et élégant.",
  keywords: [
    "invitation",
    "événement",
    "mariage",
    "anniversaire",
    "soutenance",
    "gestion d'événements",
    "Octavia",
  ],
  authors: [{ name: "Octavia", url: "https://evenement-digital.vercel.app" }],
  creator: "Octavia",
  publisher: "Octavia",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://evenement-digital.vercel.app",
  },
  openGraph: {
    title: "Octavia - Gestion d'événements",
    description:
      "Créez, gérez et partagez vos invitations en ligne. Simple, rapide et élégant.",
    url: "https://evenement-digital.vercel.app",
    siteName: "Octavia",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Octavia - Gestion d'événements",
        type: "image/png",
      },
    ],
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Octavia - Gestion d'événements",
    description:
      "Créez, gérez et partagez vos invitations en ligne. Simple, rapide et élégant.",
    images: ["/og-image.png"],
    creator: "@octavia",
    site: "@octavia",
  },
  appleWebApp: {
    capable: true,
    title: "Octavia",
    statusBarStyle: "black-translucent",
  },
  applicationName: "Octavia",
  icons: {
    icon: [
      { url: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
  },
  manifest: "/manifest.json",
  themeColor: "#5F62E2",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <BackButtonFloating />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}