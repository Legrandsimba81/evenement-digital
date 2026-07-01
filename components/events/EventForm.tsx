"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { uploadImage } from "@/actions/upload-actions";
import { createEvent, updateEvent } from "@/actions/event-actions";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Gift, Heart, Trophy, Music, Sparkles } from "lucide-react";
import ImageUploadWithCrop from "@/components/forms/ImageUploadWithCrop";
import { getThemeById } from "@/lib/themes";

type EventType = "ANNIVERSAIRE" | "MARIAGE" | "SOUTENANCE" | "AUTRE";

const typeColors = {
  ANNIVERSAIRE: "bg-pink-500",
  MARIAGE: "bg-red-500",
  SOUTENANCE: "bg-purple-500",
  AUTRE: "bg-blue-500",
};

const typeIcons = {
  ANNIVERSAIRE: Gift,
  MARIAGE: Heart,
  SOUTENANCE: Trophy,
  AUTRE: Music,
};

const suggestions = {
  ANNIVERSAIRE: {
    titles: ["Anniversaire de Sarah", "Anniversaire de Jean", "Fête d'anniversaire"],
    invitationTexts: [
      "Nous avons le plaisir de vous inviter à l'anniversaire de ...",
      "Venez célébrer avec nous les ... ans de ...",
    ],
    locations: ["Hotel Believe", "Hotel Auberge", "Monde Juste"],
  },
  MARIAGE: {
    titles: ["Mariage de Jean et Marie", "Union de Paul et Claire", "Noce de Pierre et Sophie"],
    invitationTexts: [
      "Les familles {nom} et {nom} ont l'immense plaisir de vous convier aux cérémonies de mariage civil et religieux de leurs enfants, {noms} et {noms}, qui se tiendront le {jour} 00 mois année. Votre présence à cette heureuse célébration sera pour les mariés et leurs familles un précieux témoignage d'affection et d'amitié. Nous serons honorés de partager avec vous ce moment inoubliable. Vous êtes cordialement les bienvenus !.",
      
    ],
    locations: ["Hotel Believe", "Hotel Auberge", "Monde Juste"],
  },
  SOUTENANCE: {
    titles: ["Soutenance de thèse de ...", "Soutenance de Master de ..."],
    invitationTexts: [
      "J'ai l'honneur de vous inviter à ma soutenance de thèse...",
      "Venez assister à ma soutenance de mémoire...",
    ],
    locations: ["Université de L'assomption au congo", "UCG", "ISTM", "UOR"],
  },
  AUTRE: {
    titles: ["Événement spécial", "Fête de ...", "Célébration de ..."],
    invitationTexts: [
      "Nous avons le plaisir de vous inviter à ...",
      "Venez nombreux célébrer ...",
    ],
    locations: ["Hotel Believe", "Hotel Auberge", "Monde Juste", "Raine de la paix"],
  },
};

// ✅ Schéma mis à jour : plus de brideName, groomName, age
const eventSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  type: z.string().min(1, "Type requis"),
  description: z.string().optional(),
  invitationText: z.string().optional(),
  program: z.string().optional(),
  location: z.string().min(1, "Le lieu est requis"),
  date: z.string().min(1, "La date est requise"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM requis"),
  whatsappNumber: z.string().optional(),
  thesisTitle: z.string().optional(), // uniquement pour les soutenances
});

type EventFormData = z.infer<typeof eventSchema>;

const VALID_EVENT_FIELDS = [
  "title",
  "type",
  "description",
  "invitationText",
  "program",
  "location",
  "date",
  "time",
  "whatsappNumber",
  "imageUrl",
  "invitationImageUrl",
  "thesisTitle",
];

export default function EventForm({
  initialData,
  type: propType,
  themeId: propThemeId,
}: {
  initialData?: any;
  type?: EventType;
  themeId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const themeFromUrl = searchParams.get("theme");
  const isEdit = !!initialData;

  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(
    initialData?.imageUrl || null
  );
  const [invitationImageFile, setInvitationImageFile] = useState<File | null>(null);
  const [invitationImagePreview, setInvitationImagePreview] = useState<string | null>(
    initialData?.invitationImageUrl || null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const type = propType || initialData?.type || "AUTRE";

  let existingThemeId = null;
  if (initialData?.theme) {
    try {
      const themeObj =
        typeof initialData.theme === "string" ? JSON.parse(initialData.theme) : initialData.theme;
      existingThemeId = themeObj.id;
    } catch {}
  }

  const [themeId, setThemeId] = useState<string | null>(
    existingThemeId || propThemeId || themeFromUrl || null
  );

  const defaultValues: EventFormData = {
    type: type,
    title: initialData?.title || "",
    location: initialData?.location || "",
    date: initialData?.date || "",
    time: initialData?.time || "",
    description: initialData?.description || "",
    invitationText: initialData?.invitationText || "",
    program: initialData?.program || "",
    whatsappNumber: initialData?.whatsappNumber || "",
    thesisTitle: initialData?.thesisTitle || "",
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues,
  });

  const handleHeroImageChange = (file: File | null, preview: string | null) => {
    setHeroImageFile(file);
    setHeroImagePreview(preview);
    setErrorMessage(null);
  };

  const handleInvitationImageChange = (file: File | null, preview: string | null) => {
    setInvitationImageFile(file);
    setInvitationImagePreview(preview);
    setErrorMessage(null);
  };

  const applySuggestion = (field: keyof EventFormData, value: string) => {
    setValue(field, value as any);
    setErrorMessage(null);
  };

  const onSubmit = async (data: EventFormData) => {
    setErrorMessage(null);

    if (!data.title || !data.location || !data.date || !data.time) {
      setErrorMessage("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const dateObj = new Date(data.date);
    if (isNaN(dateObj.getTime())) {
      setErrorMessage("La date est invalide.");
      return;
    }

    try {
      let heroImageUrl = initialData?.imageUrl || "";
      let invitationImageUrl = initialData?.invitationImageUrl || "";

      if (heroImageFile) {
        const formData = new FormData();
        formData.append("file", heroImageFile);
        const uploaded = await uploadImage(formData);
        heroImageUrl = uploaded.url;
      }

      if (invitationImageFile) {
        const formData = new FormData();
        formData.append("file", invitationImageFile);
        const uploaded = await uploadImage(formData);
        invitationImageUrl = uploaded.url;
      }

      const cleanData: any = {};
      for (const key of VALID_EVENT_FIELDS) {
        const value = data[key as keyof EventFormData];
        if (value !== undefined && value !== null) {
          cleanData[key] = value;
        }
      }

      let themeData = null;
      if (themeId) {
        const theme = getThemeById(themeId);
        if (theme) {
          themeData = theme;
        }
      }

      const payload = {
        ...cleanData,
        date: dateObj,
        imageUrl: heroImageUrl,
        invitationImageUrl,
        theme: themeData ? JSON.stringify(themeData) : null,
      };

      let result;
      if (initialData) {
        result = await updateEvent(initialData.slug, payload);
      } else {
        result = await createEvent(payload);
      }

      if (result.success) {
        router.push("/dashboard");
      } else {
        setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
      }
    } catch (error: any) {
      console.error("❌ Erreur dans onSubmit:", error);
      setErrorMessage(error.message || "Une erreur est survenue. Veuillez réessayer.");
    }
  };

  const Icon = typeIcons[type as EventType];
  const colorClass = typeColors[type as EventType];
  const typeSuggestions = suggestions[type as EventType] || suggestions["AUTRE"];

  const handleChooseTheme = () => {
    const currentPath = window.location.pathname;
    router.push(`/dashboard/event/new/${type}?returnTo=${encodeURIComponent(currentPath)}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type d'événement
            </label>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className={`p-2 rounded-full ${colorClass} text-white`}>
                <Icon size={18} />
              </div>
              <span className="font-medium text-gray-900 dark:text-white">{type}</span>
            </div>
            <input type="hidden" {...register("type")} value={type} />
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre de l'événement
            </label>
            <input
              {...register("title")}
              placeholder="Ex: Anniversaire de Sarah"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
              required
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {typeSuggestions.titles.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => applySuggestion("title", s)}
                  className="text-xs px-3 py-1 rounded-full bg-primary-100 text-primary-700 hover:bg-primary-200 transition dark:bg-primary-900/30 dark:text-primary-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Sujet de thèse (uniquement pour les soutenances) */}
          {type === "SOUTENANCE" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sujet de thèse
              </label>
              <input
                {...register("thesisTitle")}
                placeholder="Titre de la thèse"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          )}

          {/* Texte d'invitation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texte d'invitation
            </label>
            <textarea
              {...register("invitationText")}
              placeholder="Votre message..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
              rows={4}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {typeSuggestions.invitationTexts.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => applySuggestion("invitationText", s)}
                  className="text-xs px-3 py-1 rounded-full bg-secondary-100 text-secondary-700 hover:bg-secondary-200 transition dark:bg-secondary-900/30 dark:text-secondary-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Programme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Programme de la journée
            </label>
            <textarea
              {...register("program")}
              placeholder="Ex: 08h-10h: Messe..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
              rows={4}
            />
          </div>

          {/* Lieu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lieu
            </label>
            <input
              {...register("location")}
              placeholder="Adresse du lieu"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
              required
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {typeSuggestions.locations.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => applySuggestion("location", s)}
                  className="text-xs px-3 py-1 rounded-full bg-accent-100 text-accent-700 hover:bg-accent-200 transition dark:bg-accent-900/30 dark:text-accent-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Date / Heure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                {...register("date")}
                type="date"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                required
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heure
              </label>
              <input
                {...register("time")}
                type="time"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                required
              />
              {errors.time && (
                <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
              )}
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              WhatsApp (contact)
            </label>
            <input
              {...register("whatsappNumber")}
              placeholder="Ex: 0827733286"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Images */}
          <div className="space-y-6">
            <ImageUploadWithCrop
              label="Image héros (paysage)"
              aspect={16 / 9}
              initialPreview={heroImagePreview}
              onImageChange={handleHeroImageChange}
              description="Image au format paysage (16:9) pour la section héros"
              maxSizeMB={1.5}
            />

            <ImageUploadWithCrop
              label="Image de l'invitation (paysage)"
              aspect={16 / 9}
              initialPreview={invitationImagePreview}
              onImageChange={handleInvitationImageChange}
              description="Image au format paysage (16:9) pour l'invitation téléchargeable"
              maxSizeMB={1.5}
            />
          </div>

          {/* Thème */}
          {isEdit && !existingThemeId && (
            <div>
              <button
                type="button"
                onClick={handleChooseTheme}
                className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
              >
                <Sparkles size={16} />
                Choisir un thème
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Sélectionnez un thème pour personnaliser l'apparence de votre invitation.
              </p>
            </div>
          )}

          {themeId && (
            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center gap-2">
              <Sparkles size={18} className="text-primary-500 dark:text-primary-400" />
              <p className="text-sm text-primary-700 dark:text-primary-300">
                Thème sélectionné : {getThemeById(themeId)?.name || "Thème personnalisé"}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-6 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] touch-manipulation text-base"
          >
            {isSubmitting
              ? "Enregistrement..."
              : initialData
                ? "Modifier l'événement"
                : "Créer l'événement"}
          </button>
        </form>
      </div>
    </div>
  );
}