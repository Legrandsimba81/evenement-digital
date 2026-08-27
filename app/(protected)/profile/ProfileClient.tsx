"use client";

import { useState } from "react";
import Link from "next/link";
import { ProfileHeaderCard } from "@/components/profile/ProfileHeaderCard";
import { ProfileEventsCard } from "@/components/profile/ProfileEventsCard";
import { ProfileShopsCard } from "@/components/profile/ProfileShopsCard";
import { ProfileWalletCard } from "@/components/profile/ProfileWalletCard";
import { ProfileNotificationsCard } from "@/components/profile/ProfileNotificationsCard";
import { UpdatePhoneModal } from "@/components/profile/UpdatePhoneModal";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description: string | null;
  status: string;
  createdAt: Date;
};

type Event = {
  id: string;
  title: string;
  type: string;
  date: Date;
  slug: string;
};

type Shop = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  city?: string | null;
  category?: { name: string } | null;
};

type User = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  balance: number;
  createdAt: Date;
  emailVerified: Date | null;
  events: Event[];
  transactions: Transaction[];
  shops: Shop[];
};

interface ProfileClientProps {
  user: User;
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* En-tête de page */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mon profil</h1>
          <p className="text-gray-600 dark:text-gray-400">Gérez vos informations, votre portefeuille et vos préférences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne de gauche : Informations personnelles, Événements, Boutiques & Liens légaux */}
          <div className="lg:col-span-2 space-y-6">
            <ProfileHeaderCard
              user={user}
              formatDate={formatDate}
              onOpenPhoneModal={() => setIsPhoneModalOpen(true)}
            />

            <ProfileEventsCard events={user.events} formatDate={formatDate} />

            <ProfileShopsCard shops={user.shops} />

            {/* Informations légales */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                Informations légales
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/mentions-legales" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition">
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link href="/politique-confidentialite" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition">
                    Politique de confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/cgu" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition">
                    Conditions Générales d'Utilisation
                  </Link>
                </li>
                <li>
                  <Link href="/guide-utilisation" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition">
                    Guide d'utilisation
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Colonne de droite : Portefeuille & Notifications */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileWalletCard
              balance={user.balance}
              transactions={user.transactions}
              formatCurrency={formatCurrency}
            />

            <ProfileNotificationsCard />
          </div>
        </div>
      </div>

      {/* Modal de modification du numéro de téléphone */}
      <UpdatePhoneModal
        initialPhone={user.phone || ""}
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
      />
    </div>
  );
}