import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.octaviaevent.com"),
  title: {
    default: "Octavia Event | Invitations & Gestion d'événements numériques en RDC",
    template: "%s | Octavia Event",
  },
  description: "Créez, gérez et partagez vos invitations numériques en quelques clics en RDC. Vos événements pour Mariage, Soutenance, Anniversaire et Fête, simples, rapides et élégants.",
  keywords: [
    "invitation numérique",
    "invitation en ligne",
    "gestion d'événements",
    "mariage RDC",
    "soutenance Kinshasa",
    "anniversaire",
    "faire-part électronique",
    "Octavia Event",
    "Octavia",
  ],
  authors: [{ name: "Octavia Event", url: "https://www.octaviaevent.com" }],
  creator: "Octavia Event",
  publisher: "Octavia Event",
  verification: {
    google: "K3mCpK58xHzlJbOkuwCsrHYAP_J0pO24FNGIjSAA3Pw",
  },
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
    canonical: "https://octaviaevent.com",
  },
  openGraph: {
    title: "Octavia Event - Gestion d'événements numériques",
    description: "Créez, gérez et partagez vos invitations en ligne. Plus besoin d'imprimer, tout est numérique, élégant et efficace.",
    url: "https://octaviaevent.com",
    siteName: "Octavia Event",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Octavia Event - Aperçu de la plateforme de gestion d'invitations",
        type: "image/png",
      },
    ],
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Octavia Event - Gestion d'événements numériques",
    description: "Créez, gérez et partagez vos invitations en ligne. Simple, rapide et élégant.",
    images: ["/og-image.png"],
    creator: "@octaviaevent",
    site: "@octaviaevent",
  },
  appleWebApp: {
    capable: true,
    title: "Octavia Event",
    statusBarStyle: "black-translucent",
  },
  applicationName: "Octavia Event",
  icons: {
    icon: "/icon.png",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: [{ url: "/icon.png" }],
  },
  manifest: "/manifest.json",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  category: "technology",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#5F62E2",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Octavia Event",
    "url": "https://octaviaevent.com",
    "logo": "https://octaviaevent.com/icon.png",
    "sameAs": [
      "https://facebook.com/octaviaevent",
      "https://twitter.com/octaviaevent"
    ],
    "description": "Plateforme de gestion et de création d'invitations numériques en RDC."
  };

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}