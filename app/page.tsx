"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle,
  Users,
  Share2,
  Sparkles,
  ArrowRight,
  Gift,
  Heart,
  Music,
  Trophy,
} from "lucide-react";

export default function HomePage() {
  const { data: session } = useSession();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const features = [
    {
      icon: Calendar,
      title: "Invitations personnalisées",
      description: "Créez des invitations uniques avec vos photos et textes.",
    },
    {
      icon: Users,
      title: "Gestion des invités",
      description: "Ajoutez, supprimez et suivez vos invités facilement.",
    },
    {
      icon: Share2,
      title: "Partage instantané",
      description: "Partagez le lien par WhatsApp, email ou réseaux sociaux.",
    },
    {
      icon: CheckCircle,
      title: "Suivi en temps réel",
      description: "Voyez qui a consulté l'invitation et les messages laissés.",
    },
  ];

  const eventTypes = [
    { icon: Gift, label: "Anniversaire", color: "bg-pink-100 text-pink-600" },
    { icon: Heart, label: "Mariage", color: "bg-red-100 text-red-600" },
    { icon: Trophy, label: "Soutenance", color: "bg-purple-100 text-purple-600" },
    { icon: Music, label: "Fête", color: "bg-blue-100 text-blue-600" },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 py-20 text-white">
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur">
              <Sparkles className="h-4 w-4" />
              <span>Gérez vos événements comme un pro</span>
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Simba Event
              <span className="block text-secondary-200">L'invitation numérique nouvelle génération</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/80">
              Créez, gérez et partagez vos invitations en quelques clics. Plus besoin d'imprimer
              ou de distribuer manuellement. Tout est numérique, élégant et efficace.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {session ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-primary-600 transition hover:bg-gray-100"
                >
                  Accéder à mon tableau de bord
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-primary-600 transition hover:bg-gray-100"
                  >
                    Commencer gratuitement
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                  >
                    Se connecter
                  </Link>
                </>
              )}
            </div>
            <p className="mt-4 text-sm text-white/60">Aucune carte bancaire requise</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Pourquoi choisir Simba Event ?
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Tout ce dont vous avez besoin pour une gestion d'événements sans stress.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Event Types Section */}
      <section className="bg-gray-50 py-20 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Pour tous vos événements
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Des invitations adaptées à chaque occasion.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {eventTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-6 transition hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className={`rounded-full p-3 ${type.color}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <span className="mt-3 font-medium text-gray-900 dark:text-white">
                    {type.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl rounded-3xl bg-primary-600 px-6 py-16 text-center text-white sm:px-12">
          <h2 className="text-3xl font-bold">
            Prêt à créer votre prochain événement ?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Rejoignez des milliers d'utilisateurs qui simplifient la gestion de leurs événements.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={session ? "/dashboard/event/new" : "/register"}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-primary-600 transition hover:bg-gray-100"
            >
              Créer mon invitation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Simba Event. Tous droits réservés.</p>
        </div>
      </footer>
    </main>
  );
} 