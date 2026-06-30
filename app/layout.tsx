import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButtonWrapper from "@/components/ui/BackButtonWrapper";
import BackButton from "@/components/ui/BackButton";
import BackButtonFloating from "@/components/ui/BackButtonFloating";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Octavia - Gestion d'événements",
  description: "Créez, gérez et partagez vos invitations en ligne. Simple, rapide et élégant.",
  // ... autres métadonnées
  openGraph: {
    title: "Octavia - Gestion d'événements",
    description: "Créez, gérez et partagez vos invitations en ligne.",
    images: [
      {
        url: "/og-image.png", // placez une image dans public/
        width: 1200,
        height: 630,
        alt: "Octavia",
      },
    ],
    type: "website",
    url: "https://evenement-digital.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Octavia - Gestion d'événements",
    description: "Créez, gérez et partagez vos invitations en ligne.",
    images: ["/og-image.png"],
  },
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