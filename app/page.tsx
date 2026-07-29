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
  Clock,
  MapPin,
  ChevronRight,
  Euro,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { EventWithGuests } from "@/types";

const typeIcons: Record<string, any> = {
  ANNIVERSAIRE: Gift,
  MARIAGE: Heart,
  SOUTENANCE: Trophy,
  AUTRE: Music,
};

export default function HomePage() {
  const { data: session } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [events, setEvents] = useState<EventWithGuests[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    if (session?.user?.id) {
      fetch(`/api/user/events?userId=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => {
          setEvents(data || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session]);

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

  const pricingPlans = [
    {
      name: "Starter",
      price: "Gratuit",
      features: ["1 événement", "Jusqu'à 50 invités", "Invitation personnalisée", "Statistiques de base"],
      cta: "Commencer",
      href: "/register",
    },
    {
      name: "Pro",
      price: "19€/mois",
      features: ["Événements illimités", "Invités illimités", "QR code personnalisé", "Collaborateurs (2)"],
      cta: "Essayer",
      href: "/register",
      popular: true,
    },
    {
      name: "Business",
      price: "49€/mois",
      features: ["Tout ce que Pro", "Collaborateurs illimités", "Support prioritaire", "Analyses avancées"],
      cta: "Contacter",
      href: "/contact",
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 py-20 text-white">
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur">
              <Sparkles className="h-4 w-4" />
              <span>Gérez vos événements comme un pro</span>
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Octavia Event
              <span className="block text-indigo-200">L'invitation numérique nouvelle génération</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/80">
              Créez, gérez et partagez vos invitations en quelques clics. Plus besoin d'imprimer
              ou de distribuer manuellement. Tout est numérique, élégant et efficace.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {session ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-indigo-600 transition hover:bg-gray-100"
                >
                  Accéder à mon tableau de bord
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-indigo-600 transition hover:bg-gray-100"
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
            <p className="mt-4 text-sm text-white/60">Aucune carte bancaire requise pour commencer</p>
          </div>
        </div>
      </section>

      {/* Mes événements */}
      {session && (
        <section className="py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mes événements</h2>
              <Link href="/dashboard" className="text-indigo-500 hover:text-indigo-600 text-sm font-medium flex items-center gap-1">
                Voir tout <ArrowRight size={16} />
              </Link>
            </div>
            {loading ? (
              <div className="text-center py-12">Chargement...</div>
            ) : events.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
                <p className="text-gray-600 dark:text-gray-400">
                  Vous n'avez pas encore d'événements.{" "}
                  <Link href="/dashboard/event/new" className="text-indigo-500 hover:underline">
                    Créez votre premier événement
                  </Link>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.slice(0, 6).map((event) => {
                  const Icon = typeIcons[event.type] || Calendar;
                  return (
                    <div
                      key={event.id}
                      className="group bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-800"
                    >
                      {event.imageUrl && (
                        <div className="relative w-full aspect-video overflow-hidden">
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-indigo-500">
                          <Icon size={18} />
                          <span className="text-sm font-medium">{event.type}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors mt-1">
                          {event.title}
                        </h3>
                        <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={16} />
                            <span>{event.guests.length} invités</span>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Link
                            href={`/dashboard/${event.slug}`}
                            className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                          >
                            Gérer
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Pourquoi choisir Octavia Event ?</h2>
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
                  className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 group"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <Icon className="h-7 w-7" />
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

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Nos tarifs</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Une offre adaptée à chaque besoin.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl bg-white p-8 shadow-md transition hover:shadow-xl dark:bg-gray-900 border ${
                  plan.popular
                    ? "border-indigo-500 dark:border-indigo-400"
                    : "border-gray-200 dark:border-gray-800"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-4 py-1 text-sm font-medium text-white">
                    Populaire
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <CheckCircle size={18} className="text-indigo-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link
                    href={plan.href}
                    className={`block w-full rounded-full py-3 text-center font-semibold transition ${
                      plan.popular
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            * Les tarifs sont en euros, hors taxes. Des offres personnalisées sont disponibles pour les grandes entreprises.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 py-16 px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold">Prêt à créer votre prochain événement ?</h2>
          <p className="mt-4 text-lg text-white/90">
            Rejoignez des milliers d'utilisateurs qui simplifient la gestion de leurs événements.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={session ? "/dashboard/event/new" : "/register"}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-indigo-600 transition hover:bg-gray-100"
            >
              Créer mon invitation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}