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
  title: "Octavia Event",
  description: "Générez et gérez vos invitations d'événements facilement",
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