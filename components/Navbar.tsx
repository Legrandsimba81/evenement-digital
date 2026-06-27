"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  BellRing,
  CircleDollarSign,
  Home,
  LayoutGrid,
  LogOut,
  Moon,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Sun,
  UserRound,
} from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = storedTheme ?? (prefersDark ? "dark" : "light");

    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/", label: "Accueil", icon: Home },
    { href: "/dashboard", label: "Mes événements", icon: LayoutGrid },
    { href: "/dashboard/event/new", label: "Créer", icon: PlusCircle },
  ];

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  const userName = session?.user?.name || session?.user?.email || "Utilisateur";
  const userEmail = session?.user?.email || "utilisateur@example.com";
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/10 text-primary">
            <Sparkles size={18} />
          </div>
          <span className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
            Octavia<span className="text-primary">Event</span>
          </span>
        </Link>

        <div className="flex">
          <nav className="hidden md:flex md:items-center md:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex min-w-max items-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm font-normal text-gray-700 transition hover:border-gray-200 hover:bg-gray-50 hover:text-primary dark:text-gray-400 dark:hover:border-gray-800 dark:hover:bg-gray-900 dark:hover:text-white"
                >
                  <Icon size={16} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Basculer le thème"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {session ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1.5 text-sm font-semibold text-gray-700 transition hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                  title={userName}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/15 text-xs text-primary">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={userName}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <span className="hidden sm:inline">{userName}</span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-950">
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/70">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {userName}
                      </p>
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                        {userEmail}
                      </p>
                    </div>

                    <div className="mt-2 space-y-1">
                      <Link
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900"
                      >
                        <UserRound size={16} className="text-primary" />
                        Mon profil
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900"
                      >
                        <UserRound size={16} className="text-primary" />
                        Mon tableau de bord
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900"
                        >
                          <ShieldCheck size={16} className="text-primary" />
                          Dashboard admin
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900"
                      >
                        <LogOut size={16} className="text-primary" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-600"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="border-t border-gray-100 bg-white/90 dark:border-gray-900 dark:bg-gray-950 md:hidden">
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-w-max items-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm font-normal text-gray-700 transition hover:border-gray-200 hover:bg-gray-50 hover:text-primary dark:text-gray-400 dark:hover:border-gray-800 dark:hover:bg-gray-900 dark:hover:text-white"
              >
                <Icon size={16} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}