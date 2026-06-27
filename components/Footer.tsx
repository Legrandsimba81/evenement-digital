"use client";

import Link from "next/link";
import { 
  FaHeart, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaGithub, 
  FaTwitter, 
  FaFacebook, 
  FaInstagram 
} from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Colonne 1 - Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
              <span className="text-primary-500">Simba</span>Event
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Créez et gérez vos invitations en quelques clics. Simple, rapide et élégant.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition" aria-label="Twitter">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition" aria-label="Facebook">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition" aria-label="Instagram">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition" aria-label="GitHub">
                <FaGithub size={20} />
              </a>
            </div>
          </div>

          {/* Colonne 2 - Liens rapides */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Liens utiles</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/dashboard" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition">
                  Tableau de bord
                </Link>
              </li>
              <li>
                <Link href="/dashboard/event/new" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition">
                  Créer un événement
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition">
                  Mon profil
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 - Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Contact</h3>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FaEnvelope size={16} />
                <a href="mailto:contact@simba-event.com" className="hover:text-primary-500 transition">
                  contact@simba-event.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FaPhone size={16} />
                <a href="tel:+243827733286" className="hover:text-primary-500 transition">
                  +243 827733286
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FaMapMarkerAlt size={16} />
                <span>RDC, Nord-Kivu</span>
              </li>
            </ul>
          </div>

          {/* Colonne 4 - À propos */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">À propos</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/mentions-legales" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/politique-confidentialite" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/cgu" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition">
                  CGU
                </Link>
              </li>
              <li>
                <Link href="/guide-utilisation" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition">
                  Guide d'utilisation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            &copy; {currentYear} Simba Event. Tous droits réservés. pour vos événements numériques en RDCongo.
          </p>
        </div>
      </div>
    </footer>
  );
}