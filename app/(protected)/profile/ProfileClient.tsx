"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Calendar,
  Mail,
  User,
  Users,
  Wallet,
  ArrowDownRight,
  CreditCard,
  Plus,
  X,
  Loader2,
  Phone,
  Bell,
  ChevronRight,
  BookOpen,
  Edit,
} from "lucide-react";

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

type User = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  balance: number;
  createdAt: Date;
  events: Event[];
  transactions: Transaction[];
};

interface ProfileClientProps {
  user: User;
}

// Notifications simulées (à remplacer par des données réelles de la DB)
const mockNotifications = [
  { id: "1", message: "Votre dépôt de 5$ a été validé.", read: false, createdAt: new Date() },
  { id: "2", message: "Votre événement 'Anniversaire de Marie' est prêt.", read: true, createdAt: new Date() },
  { id: "3", message: "Limite d'invités atteinte pour les événements de type 'Mariage'.", read: false, createdAt: new Date() },
];

export default function ProfileClient({ user }: ProfileClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState(user.phone || "");
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [unreadCount, setUnreadCount] = useState(mockNotifications.filter((n) => !n.read).length);

  // Formatage
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

  // Mise à jour du téléphone
  const handleUpdatePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/update-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Numéro de téléphone mis à jour !");
        setIsPhoneModalOpen(false);
        router.refresh();
      } else {
        alert(data.error || "Erreur lors de la mise à jour.");
      }
    } catch {
      alert("Erreur réseau.");
    } finally {
      setIsLoading(false);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (id: string) => {
    // Simuler un appel API
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mon profil</h1>
          <p className="text-gray-600 dark:text-gray-400">Gérez vos informations, votre portefeuille et vos préférences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne de gauche : Infos personnelles et événements */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carte d'identité */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50">
              <div className="flex items-start gap-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {user.name || "Utilisateur"}
                  </h2>
                  <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-blue-500" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-blue-500" />
                      <span>{user.phone || "Non renseigné"}</span>
                      <button
                        onClick={() => setIsPhoneModalOpen(true)}
                        className="ml-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                      >
                        <Edit size={14} />
                        {user.phone ? "Modifier" : "Ajouter"}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-blue-500" />
                      <span>Rôle : {user.role}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-blue-500" />
                      <span>Membre depuis le {formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Derniers événements */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users size={18} className="text-blue-500" />
                Mes derniers événements
              </h3>
              {user.events.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">Vous n'avez pas encore créé d'événement.</p>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {user.events.map((event) => (
                    <li key={event.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {event.type} • {formatDate(event.date)}
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/${event.slug}`}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium inline-flex items-center gap-1"
                      >
                        Gérer
                        <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {user.events.length > 0 && (
                <div className="mt-4 text-center">
                  <Link href="/dashboard" className="text-blue-600 hover:underline dark:text-blue-400 text-sm">
                    Voir tous mes événements
                  </Link>
                </div>
              )}
            </div>

            {/* Guide d'utilisation */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Guide d'utilisation</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Découvrez toutes les fonctionnalités de la plateforme.</p>
                  </div>
                </div>
                <Link
                  href="/guide-utilisation"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
                >
                  Lire le guide
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* Colonne de droite : Portefeuille + Notifications */}
          <div className="lg:col-span-1 space-y-6">
            {/* Portefeuille */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Wallet size={18} className="text-blue-500" />
                  Portefeuille
                </h3>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  Actif
                </span>
              </div>

              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">Solde disponible</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(user.balance)}
                </p>
              </div>

              {/* Bouton Déposer (redirige vers les tarifs) */}
              <button
                onClick={() => router.push("/tarifs")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition text-sm font-medium"
              >
                <Plus size={16} />
                Déposer des fonds
              </button>

              {/* Historique des transactions */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <CreditCard size={14} />
                  Dernières transactions
                </h4>
                {user.transactions.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Aucune transaction.</p>
                ) : (
                  <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {user.transactions.map((tx) => (
                      <li key={tx.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <div className="flex items-center gap-2">
                          {tx.type === "deposit" && <ArrowDownRight size={14} className="text-green-500" />}
                          {tx.type === "payment" && <CreditCard size={14} className="text-blue-500" />}
                          <span className="text-gray-700 dark:text-gray-300">
                            {tx.type === "deposit" ? "Dépôt" : "Paiement"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-medium ${tx.type === "deposit" ? "text-green-600" : "text-blue-600"}`}>
                            {tx.type === "deposit" ? "+" : "-"}
                            {formatCurrency(tx.amount)}
                          </span>
                          <span className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Bell size={18} className="text-blue-500" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h3>
                {notifications.length > 0 && (
                  <button
                    onClick={() => {
                      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                      setUnreadCount(0);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">Aucune notification.</p>
              ) : (
                <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={`flex items-start gap-2 text-sm py-2 px-2 rounded-lg ${!n.read ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                    >
                      <div className="flex-1">
                        <p className="text-gray-700 dark:text-gray-300">{n.message}</p>
                        <p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                      {!n.read && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Marquer lu
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de modification du téléphone */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {user.phone ? "Modifier" : "Ajouter"} mon numéro de téléphone
              </h3>
              <button
                onClick={() => setIsPhoneModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X size={24} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleUpdatePhone} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+243 XXX XXX XXX"
                  required
                  className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}