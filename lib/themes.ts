// lib/themes.ts
import { Heart, Gift, Trophy, Music, Sparkles } from "lucide-react";

export type Theme = {
  id: string;
  name: string;
  description: string;
  category: string; // MARIAGE, ANNIVERSAIRE, SOUTENANCE, AUTRE
  previewImage?: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
    text: string;
  };
  icons: {
    main: any;
    secondary?: any;
  };
  animation: string; // "hearts", "balloons", "confetti", "stars", "none"
  backgroundStyle?: string; // "gradient", "solid", "pattern"
  className?: string; // classes Tailwind additionnelles
  invitationTitle?: string; // personnalisation du titre
};

export const themes: Theme[] = [
  // --- Mariage ---
  {
    id: "wedding-romantic",
    name: "Romantique",
    description: "Cœurs et couleurs chaudes pour un mariage inoubliable.",
    category: "MARIAGE",
    colors: {
      primary: "rose-600",
      secondary: "pink-500",
      background: "rose-50",
      accent: "red-500",
      text: "gray-900",
    },
    icons: { main: Heart, secondary: Sparkles },
    animation: "hearts",
    backgroundStyle: "gradient",
    className: "bg-gradient-to-br from-rose-50 to-pink-50",
    invitationTitle: "Invitation de mariage",
  },
  {
    id: "wedding-elegant",
    name: "Élégant",
    description: "Classique et raffiné.",
    category: "MARIAGE",
    colors: {
      primary: "indigo-600",
      secondary: "purple-500",
      background: "indigo-50",
      accent: "gold-500",
      text: "gray-900",
    },
    icons: { main: Heart, secondary: Sparkles },
    animation: "stars",
    backgroundStyle: "solid",
    className: "bg-indigo-50",
    invitationTitle: "Invitation de mariage",
  },
  {
    id: "wedding-simple",
    name: "Minimaliste",
    description: "Sobriété et élégance.",
    category: "MARIAGE",
    colors: {
      primary: "gray-700",
      secondary: "gray-500",
      background: "white",
      accent: "gray-800",
      text: "gray-900",
    },
    icons: { main: Heart, secondary: Sparkles },
    animation: "none",
    backgroundStyle: "solid",
    className: "bg-white",
    invitationTitle: "Invitation de mariage",
  },

  // --- Anniversaire ---
  {
    id: "birthday-colorful",
    name: "Coloré",
    description: "Ballons et couleurs vives pour une fête joyeuse.",
    category: "ANNIVERSAIRE",
    colors: {
      primary: "pink-500",
      secondary: "yellow-400",
      background: "pink-50",
      accent: "blue-500",
      text: "gray-900",
    },
    icons: { main: Gift, secondary: Sparkles },
    animation: "balloons",
    backgroundStyle: "gradient",
    className: "bg-gradient-to-br from-pink-50 to-yellow-50",
    invitationTitle: "Invitation d'anniversaire",
  },
  {
    id: "birthday-party",
    name: "Party",
    description: "Ambiance festive avec confettis.",
    category: "ANNIVERSAIRE",
    colors: {
      primary: "purple-600",
      secondary: "orange-400",
      background: "purple-50",
      accent: "green-500",
      text: "gray-900",
    },
    icons: { main: Gift, secondary: Sparkles },
    animation: "confetti",
    backgroundStyle: "gradient",
    className: "bg-gradient-to-br from-purple-50 to-orange-50",
    invitationTitle: "Invitation d'anniversaire",
  },
  {
    id: "birthday-simple",
    name: "Classique",
    description: "Simple et efficace.",
    category: "ANNIVERSAIRE",
    colors: {
      primary: "blue-600",
      secondary: "blue-400",
      background: "white",
      accent: "blue-800",
      text: "gray-900",
    },
    icons: { main: Gift, secondary: Sparkles },
    animation: "none",
    backgroundStyle: "solid",
    className: "bg-white",
    invitationTitle: "Invitation d'anniversaire",
  },

  // --- Soutenance ---
  {
    id: "defense-academic",
    name: "Académique",
    description: "Sobre et professionnel pour une soutenance.",
    category: "SOUTENANCE",
    colors: {
      primary: "blue-700",
      secondary: "blue-500",
      background: "blue-50",
      accent: "gray-600",
      text: "gray-900",
    },
    icons: { main: Trophy, secondary: Sparkles },
    animation: "none",
    backgroundStyle: "gradient",
    className: "bg-gradient-to-br from-blue-50 to-gray-50",
    invitationTitle: "Invitation à la soutenance",
  },
  {
    id: "defense-modern",
    name: "Moderne",
    description: "Design épuré et contemporain.",
    category: "SOUTENANCE",
    colors: {
      primary: "emerald-600",
      secondary: "teal-400",
      background: "emerald-50",
      accent: "gray-700",
      text: "gray-900",
    },
    icons: { main: Trophy, secondary: Sparkles },
    animation: "none",
    backgroundStyle: "solid",
    className: "bg-emerald-50",
    invitationTitle: "Invitation à la soutenance",
  },
  {
    id: "defense-classic",
    name: "Classique",
    description: "Traditionnel et sobre.",
    category: "SOUTENANCE",
    colors: {
      primary: "gray-800",
      secondary: "gray-600",
      background: "white",
      accent: "gray-900",
      text: "gray-900",
    },
    icons: { main: Trophy, secondary: Sparkles },
    animation: "none",
    backgroundStyle: "solid",
    className: "bg-white",
    invitationTitle: "Invitation à la soutenance",
  },

  // --- Autre ---
  {
    id: "other-festive",
    name: "Festif",
    description: "Ambiance de fête colorée.",
    category: "AUTRE",
    colors: {
      primary: "orange-500",
      secondary: "yellow-400",
      background: "orange-50",
      accent: "red-500",
      text: "gray-900",
    },
    icons: { main: Music, secondary: Sparkles },
    animation: "confetti",
    backgroundStyle: "gradient",
    className: "bg-gradient-to-br from-orange-50 to-yellow-50",
    invitationTitle: "Invitation",
  },
  {
    id: "other-elegant",
    name: "Élégant",
    description: "Sobre et raffiné.",
    category: "AUTRE",
    colors: {
      primary: "indigo-600",
      secondary: "purple-500",
      background: "indigo-50",
      accent: "gold-500",
      text: "gray-900",
    },
    icons: { main: Music, secondary: Sparkles },
    animation: "stars",
    backgroundStyle: "gradient",
    className: "bg-gradient-to-br from-indigo-50 to-purple-50",
    invitationTitle: "Invitation",
  },
  {
    id: "other-simple",
    name: "Minimaliste",
    description: "Design épuré.",
    category: "AUTRE",
    colors: {
      primary: "gray-700",
      secondary: "gray-500",
      background: "white",
      accent: "gray-800",
      text: "gray-900",
    },
    icons: { main: Music, secondary: Sparkles },
    animation: "none",
    backgroundStyle: "solid",
    className: "bg-white",
    invitationTitle: "Invitation",
  },
];

export function getDefaultTheme(category: string): string {
  const defaultMap: Record<string, string> = {
    MARIAGE: "wedding-romantic",
    ANNIVERSAIRE: "birthday-colorful",
    SOUTENANCE: "defense-academic",
    AUTRE: "other-festive",
  };
  return defaultMap[category] || "other-festive";
}

export function getThemeById(id: string): Theme | undefined {
  return themes.find((t) => t.id === id);
}

export function getThemesByCategory(category: string): Theme[] {
  return themes.filter((t) => t.category === category);
}