"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { uploadImage } from "@/actions/upload-actions";
import { createEvent } from "@/actions/event-actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Gift, Heart, Trophy, Music, Sparkles } from "lucide-react";
import ImageUploadWithCrop from "@/components/forms/ImageUploadWithCrop";

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

// Suggestions pour les champs
const suggestions = {
  ANNIVERSAIRE: {
    titles: ["Anniversaire de Sarah", "Anniversaire de Jean", "Fête d'anniversaire"],
    invitationTexts: [
      "Nous avons le plaisir de vous inviter à l'anniversaire de ...",
      "Venez célébrer avec nous les ... ans de ...",
    ],
    locations: ["Hotel Believe", "Hotel Auberge", "Monde Juste", "Espace Koffi"],
  },
  MARIAGE: {
    titles: ["Mariage de Jean et Marie", "Union de Paul et Claire", "Noce de Pierre et Sophie"],
    invitationTexts: [
      "Nous avons le plaisir de vous inviter à notre mariage...",
      "Avec joie, nous vous convions à notre union...",
    ],
    locations: ["Hotel Believe", "Hotel Auberge", "Monde Juste", "Espace Koffi"],
  },
  SOUTENANCE: {
    titles: ["Soutenance de thèse de ...", "Soutenance de Master de ..."],
    invitationTexts: [
      "J'ai l'honneur de vous inviter à ma soutenance de thèse...",
      "Venez assister à ma soutenance de mémoire...",
    ],
    locations: ["Université de Cocody", "Université d'Abobo", "Institut de Recherche"],
  },
  AUTRE: {
    titles: ["Événement spécial", "Fête de ...", "Célébration de ..."],
    invitationTexts: [
      "Nous avons le plaisir de vous inviter à ...",
      "Venez nombreux célébrer ...",
    ],
    locations: ["Hotel Believe", "Hotel Auberge", "Monde Juste", "Espace Koffi"],
  },
};

// Schéma de base commun à tous
const baseSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  type: z.string().min(1, "Type requis"),
  description: z.string().optional(),
  invitationText: z.string().optional(),
  program: z.string().optional(),
  location: z.string().min(1, "Le lieu est requis"),
  date: z.string().min(1, "La date est requise"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM requis"),
  whatsappNumber: z.string().optional(),
});

// Champs supplémentaires selon le type (uniquement pour la validation)
const extendedSchema = baseSchema.extend({
  brideName: z.string().optional(),
  groomName: z.string().optional(),
  age: z.string().optional(),
  thesisTitle: z.string().optional(),
});

type EventFormData = z.infer<typeof extendedSchema>;

// Champs valides pour Prisma
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
  "userId",
  "slug",
];

export default function EventTypeForm({ type }: { type: EventType }) {
  const router = useRouter();
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [invitationImageFile, setInvitationImageFile] = useState<File | null>(null);
  const [invitationImagePreview, setInvitationImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(extendedSchema),
    defaultValues: { type },
  });

  const handleHeroImageChange = (file: File | null, preview: string | null) => {
    setHeroImageFile(file);
    setHeroImagePreview(preview);
  };

  const handleInvitationImageChange = (file: File | null, preview: string | null) => {
    setInvitationImageFile(file);
    setInvitationImagePreview(preview);
  };

  // Fonction pour appliquer une suggestion
  const applySuggestion = (field: keyof EventFormData, value: string) => {
    setValue(field, value as any);
  };

  const onSubmit = async (data: EventFormData) => {
    let heroImageUrl = "";
    let invitationImageUrl = "";

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

    // ✅ Filtrer les données pour ne garder que les champs valides pour Prisma
    const cleanData: any = {};
    for (const key of VALID_EVENT_FIELDS) {
      if (data[key as keyof EventFormData] !== undefined) {
        cleanData[key] = data[key as keyof EventFormData];
      }
    }

    const payload = {
      ...cleanData,
      date: new Date(data.date),
      imageUrl: heroImageUrl,
      invitationImageUrl,
    };

    try {
      await createEvent(payload);
      router.push("/dashboard");
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      alert("Une erreur est survenue lors de la création de l'événement.");
    }
  };

  const Icon = typeIcons[type];
  const colorClass = typeColors[type];
  const typeSuggestions = suggestions[type];

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8">
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${colorClass} text-white mb-4`}>
        <Icon size={18} />
        <span className="font-medium">{type}</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Créer une invitation pour {type.toLowerCase()}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <input type="hidden" {...register("type")} value={type} />

        {/* Titre avec suggestions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Titre de l'événement
          </label>
          <input
            {...register("title")}
            placeholder="Ex: Anniversaire de Sarah"
            className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
            required
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            {typeSuggestions.titles.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => applySuggestion("title", suggestion)}
                className="text-xs px-3 py-1 rounded-full bg-primary-100 text-primary-700 hover:bg-primary-200 transition dark:bg-primary-900/30 dark:text-primary-300"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Champs spécifiques selon le type */}
        {type === "MARIAGE" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom du marié
              </label>
              <input
                {...register("groomName")}
                placeholder="Jean"
                className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom de la mariée
              </label>
              <input
                {...register("brideName")}
                placeholder="Marie"
                className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        )}

        {type === "ANNIVERSAIRE" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Âge
            </label>
            <input
              {...register("age")}
              type="number"
              placeholder="30"
              className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
            />
          </div>
        )}

        {type === "SOUTENANCE" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre de la thèse / sujet
            </label>
            <input
              {...register("thesisTitle")}
              placeholder="Titre de la thèse"
              className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
            />
          </div>
        )}

        {/* Texte d'invitation avec suggestions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Texte d'invitation
          </label>
          <textarea
            {...register("invitationText")}
            placeholder={type === "MARIAGE" ? "Nous avons le plaisir de vous inviter à notre mariage..." : "Venez célébrer avec nous..."}
            className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
            rows={4}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {typeSuggestions.invitationTexts.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => applySuggestion("invitationText", suggestion)}
                className="text-xs px-3 py-1 rounded-full bg-secondary-100 text-secondary-700 hover:bg-secondary-200 transition dark:bg-secondary-900/30 dark:text-secondary-300"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Programme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Programme
          </label>
          <textarea
            {...register("program")}
            placeholder="Ex: 08h-10h: Messe..."
            className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
            rows={4}
          />
        </div>

        {/* Lieu avec suggestions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Lieu
          </label>
          <input
            {...register("location")}
            placeholder="Adresse"
            className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
            required
          />
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            {typeSuggestions.locations.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => applySuggestion("location", suggestion)}
                className="text-xs px-3 py-1 rounded-full bg-accent-100 text-accent-700 hover:bg-accent-200 transition dark:bg-accent-900/30 dark:text-accent-300"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              {...register("date")}
              type="date"
              className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
              required
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Heure
            </label>
            <input
              {...register("time")}
              type="time"
              className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
              required
            />
            {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            WhatsApp (contact)
          </label>
          <input
            {...register("whatsappNumber")}
            placeholder="+225 01 23 45 67 89"
            className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Images */}
        <ImageUploadWithCrop
          label="Photo héros (portrait)"
          aspect={3/4}
          onImageChange={handleHeroImageChange}
          description="Image au format portrait (3:4) pour la section héros"
        />

        <ImageUploadWithCrop
          label="Image de l'invitation (paysage)"
          aspect={16/9}
          onImageChange={handleInvitationImageChange}
          description="Image au format paysage (16:9) pour l'invitation téléchargeable"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-600 transition disabled:opacity-50"
        >
          {isSubmitting ? "Création..." : "Créer l'événement"}
        </button>
      </form>
    </div>
  );
}