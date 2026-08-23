// lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate une date au format français (ex: 15 août 2025)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Formate une date et heure au format français (ex: 15 août 2025 à 14:30)
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formate un prix en FCFA ou USD
 */
export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Tronque un texte à une longueur donnée
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Génère un slug à partir d'une chaîne (ex: "Mon Titre" -> "mon-titre")
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Génère un ID aléatoire (ex: pour les références)
 */
export function generateRandomId(length: number = 8): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Valide un numéro de téléphone de la RDC (10 chiffres, commence par 0)
 */
export function isValidPhone(phone: string): boolean {
  return /^0\d{9}$/.test(phone);
}

/**
 * Nettoie un numéro de téléphone (enlève les espaces, tirets, etc.)
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\s|-|\./g, '');
}

/**
 * Formate un numéro de téléphone pour l'affichage
 * Ex: "0827733286" -> "082 773 3286"
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = cleanPhoneNumber(phone);
  if (!cleaned || cleaned.length !== 10) return phone;
  return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
}

/**
 * Formate un numéro de téléphone au format international
 * Ex: "0827733286" -> "+243 82 773 3286"
 */
export function formatPhoneInternational(phone: string): string {
  const cleaned = cleanPhoneNumber(phone);
  if (!cleaned || cleaned.length !== 10) return phone;
  const withoutZero = cleaned.substring(1); // Enlève le 0 initial
  return `+243 ${withoutZero.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3')}`;
}

/**
 * Vérifie si une URL est valide
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Retourne l'initiale d'un nom (ex: "Jean Dupont" -> "JD")
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

/**
 * Calcule une note moyenne à partir d'un tableau de notes
 */
export function calculateAverageRating(ratings: number[]): number | null {
  if (!ratings || ratings.length === 0) return null;
  const sum = ratings.reduce((a, b) => a + b, 0);
  return parseFloat((sum / ratings.length).toFixed(1));
}

/**
 * Copie du texte dans le presse-papiers (côté client)
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator === 'undefined') return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

/**
 * Retourne la couleur d'un statut (ex: pour les badges)
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    en_attente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    attending: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    annule: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    entre: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    verified: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    unverified: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
}

/**
 * Retourne le label d'un statut en français
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'En attente',
    completed: 'Terminé',
    cancelled: 'Annulé',
    accepted: 'Accepté',
    rejected: 'Refusé',
    en_attente: 'En attente',
    attending: 'Présent',
    annule: 'Annulé',
    entre: 'Entré',
    active: 'Actif',
    inactive: 'Inactif',
    verified: 'Vérifié',
    unverified: 'Non vérifié',
  };
  return labels[status] || status;
}

/**
 * Délai d'attente (pour les animations, etc.)
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Formate un nombre en notation française (ex: 1 234)
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num);
}

/**
 * Extrait le domaine d'une URL
 */
export function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

/**
 * Vérifie si une chaîne est vide (null, undefined, ou seulement des espaces)
 */
export function isEmptyString(value: string | null | undefined): boolean {
  return !value || value.trim() === '';
}

/**
 * Retourne une valeur par défaut si la valeur est vide
 */
export function defaultValue<T>(value: T | null | undefined, fallback: T): T {
  return value ?? fallback;
}

/**
 * Génère un tableau de nombres pour une pagination
 */
export function generatePagination(currentPage: number, totalPages: number): (number | string)[] {
  const delta = 2;
  const range: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i);
    } else if (range[range.length - 1] !== '...') {
      range.push('...');
    }
  }
  return range;
}

/**
 * Convertit un objet en paramètres d'URL
 */
export function objectToQueryString(obj: Record<string, any>): string {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  return params.toString();
}

export default {
  cn,
  formatDate,
  formatDateTime,
  formatPrice,
  truncateText,
  generateSlug,
  generateRandomId,
  isValidPhone,
  cleanPhoneNumber,
  formatPhoneNumber,
  formatPhoneInternational,
  isValidUrl,
  getInitials,
  calculateAverageRating,
  copyToClipboard,
  getStatusColor,
  getStatusLabel,
  sleep,
  formatNumber,
  extractDomain,
  isEmptyString,
  defaultValue,
  generatePagination,
  objectToQueryString,
};