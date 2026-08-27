// app/(auth)/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentification - Simba Event",
  description: "Connectez-vous ou inscrivez-vous pour gérer vos événements",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-7xl">{children}</div>
    </div>
  );
}