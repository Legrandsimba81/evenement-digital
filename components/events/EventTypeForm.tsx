"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { uploadImage } from "@/actions/upload-actions";
import { createEvent, updateEvent } from "@/actions/event-actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Gift, Heart, Trophy, Music } from "lucide-react";
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

const suggestions = {
  ANNIVERSAIRE: {
    titles: ["Anniversaire de Sarah", "Anniversaire de Jean", "Fête d'anniversaire"],
    invitationTexts: ["Nous avons le plaisir de vous inviter à l'anniversaire de ...", "Venez célébrer avec nous les ... ans de ..."],
    locations: ["Hotel Believe", "Hotel Auberge", "Monde Juste", "Espace Koffi"],
  },
  MARIAGE: {
    titles: ["Mariage de Jean et Marie", "Union de Paul et Claire", "Noce de Pierre et Sophie"],
    invitationTexts: ["Nous avons le plaisir de vous inviter à notre mariage...", "Avec joie, nous vous convions à notre union..."],
    locations: ["Hotel Believe", "Hotel Auberge", "Monde Juste", "Espace Koffi"],
  },
  SOUTENANCE: {
    titles: ["Soutenance de thèse de ...", "Soutenance de Master de ..."],
    invitationTexts: ["J'ai l'honneur de vous inviter à ma soutenance de thèse...", "Venez assister à ma soutenance de mémoire..."],
    locations: ["Université de Cocody", "Université d'Abobo", "Institut de Recherche"],
  },
  AUTRE: {
    titles: ["Événement spécial", "Fête de ...", "Célébration de ..."],
    invitationTexts: ["Nous avons le plaisir de vous inviter à ...", "Venez nombreux célébrer ..."],
    locations: ["Hotel Believe", "Hotel Auberge", "Monde Juste", "Espace Koffi"],
  },
};

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
  invitationType: z.enum(["single", "couple"]).default("single"),
  brideName: z.string().optional(),
  groomName: z.string().optional(),
  age: z.string().optional(),
  thesisTitle: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

const VALID_EVENT_FIELDS = [
  "title", "type", "description", "invitationText", "program",
  "location", "date", "time", "whatsappNumber",
  "imageUrl", "invitationImageUrl", "invitationType",
];

export default function EventTypeForm({ type, initialData }: { type?: EventType; initialData?: any }) {
  const router = useRouter();
  const isEdit = !!initialData;

  // États pour les images
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const [invitationImageFile, setInvitationImageFile] = useState<File | null>(null);
  const [invitationImagePreview, setInvitationImagePreview] = useState<string | null>(initialData?.invitationImageUrl || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues: EventFormData = {
    type: type || initialData?.type || "AUTRE",
    invitationType: initialData?.invitationType || "single",
    title: initialData?.title || "",
    location: initialData?.location || "",
    date: initialData?.date ? new Date(initialData.date).toISOString().split("T")[0] : "",
    time: initialData?.time || "",
    description: initialData?.description || "",
    invitationText: initialData?.invitationText || "",
    program: initialData?.program || "",
    whatsappNumber: initialData?.whatsappNumber || "",
    brideName: initialData?.brideName || "",
    groomName: initialData?.groomName || "",
    age: initialData?.age || "",
    thesisTitle: initialData?.thesisTitle || "",
  };

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<EventFormData>({
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

    // Validation des champs obligatoires
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

      // Upload des nouvelles images si elles ont été changées
      if (heroImageFile) {
        try {
          const formData = new FormData();
          formData.append("file", heroImageFile);
          const uploaded = await uploadImage(formData);
          heroImageUrl = uploaded.url;
        } catch (err) {
          console.error("❌ Erreur upload image héros:", err);
          setErrorMessage("Erreur lors du téléchargement de l'image héros.");
          return;
        }
      }

      if (invitationImageFile) {
        try {
          const formData = new FormData();
          formData.append("file", invitationImageFile);
          const uploaded = await uploadImage(formData);
          invitationImageUrl = uploaded.url;
        } catch (err) {
          console.error("❌ Erreur upload image invitation:", err);
          setErrorMessage("Erreur lors du téléchargement de l'image invitation.");
          return;
        }
      }

      // Nettoyer les données
      const cleanData: any = {};
      for (const key of VALID_EVENT_FIELDS) {
        const value = data[key as keyof EventFormData];
        if (value !== undefined && value !== null) {
          cleanData[key] = value;
        }
      }

      const payload = {
        ...cleanData,
        date: dateObj,
        imageUrl: heroImageUrl,
        invitationImageUrl,
      };

      console.log("📦 Payload:", payload);

      let result;
      if (isEdit) {
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
      console.error("❌ Erreur:", error);
      setErrorMessage(error.message || "Une erreur est survenue. Veuillez réessayer.");
    }
  };

  const currentType = type || initialData?.type || "AUTRE";
  const Icon = typeIcons[currentType as EventType];
  const colorClass = typeColors[currentType as EventType];
  const typeSuggestions = suggestions[currentType as EventType] || suggestions["AUTRE"];

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8">
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${colorClass} text-white mb-4`}>
        <Icon size={18} />
        <span className="font-medium">{currentType}</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {isEdit ? "Modifier l'invitation" : `Créer une invitation pour ${currentType.toLowerCase()}`}
      </h1>

      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <input type="hidden" {...register("type")} value={currentType} />

        {/* Titre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre</label>
          <input {...register("title")} placeholder="Ex: Anniversaire de Sarah" className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white" required />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            {typeSuggestions.titles.map((s) => (
              <button key={s} type="button" onClick={() => applySuggestion("title", s)} className="text-xs px-3 py-1 rounded-full bg-primary-100 text-primary-700 hover:bg-primary-200 transition dark:bg-primary-900/30 dark:text-primary-300">{s}</button>
            ))}
          </div>
        </div>

        {/* Champs spécifiques */}
        {currentType === "MARIAGE" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marié</label>
              <input {...register("groomName")} placeholder="Jean" className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mariée</label>
              <input {...register("brideName")} placeholder="Marie" className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white" />
            </div>
          </div>
        )}
        {currentType === "ANNIVERSAIRE" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Âge</label>
            <input {...register("age")} type="number" placeholder="30" className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white" />
          </div>
        )}
        {currentType === "SOUTENANCE" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sujet de thèse</label>
            <input {...register("thesisTitle")} placeholder="Titre de la thèse" className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white" />
          </div>
        )}

        {/* Texte d'invitation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Texte d'invitation</label>
          <textarea {...register("invitationText")} placeholder="Votre message..." className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white" rows={4} />
          <div className="flex flex-wrap gap-2 mt-2">
            {typeSuggestions.invitationTexts.map((s) => (
              <button key={s} type="button" onClick={() => applySuggestion("invitationText", s)} className="text-xs px-3 py-1 rounded-full bg-secondary-100 text-secondary-700 hover:bg-secondary-200 transition dark:bg-secondary-900/30 dark:text-secondary-300">{s}</button>
            ))}
          </div>
        </div>

        {/* Programme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Programme</label>
          <textarea {...register("program")} placeholder="Ex: 08h-10h: Messe..." className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white" rows={4} />
        </div>

        {/* Lieu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lieu</label>
          <input {...register("location")} placeholder="Adresse" className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white" required />
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            {typeSuggestions.locations.map((s) => (
              <button key={s} type="button" onClick={() => applySuggestion("location", s)} className="text-xs px-3 py-1 rounded-full bg-accent-100 text-accent-700 hover:bg-accent-200 transition dark:bg-accent-900/30 dark:text-accent-300">{s}</button>
            ))}
          </div>
        </div>

        {/* Date / Heure */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <input {...register("date")} type="date" className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white" required />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heure</label>
            <input {...register("time")} type="time" className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white" required />
            {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>}
          </div>
        </div>

        {/* Type d'invitation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type d'invitation</label>
          <select {...register("invitationType")} className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white">
            <option value="single">1 personne</option>
            <option value="couple">2 personnes (couple/famille)</option>
          </select>
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp (contact)</label>
          <input {...register("whatsappNumber")} placeholder="+225 01 23 45 67 89" className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white" />
        </div>

        {/* Deux images paysage avec compression */}
        <ImageUploadWithCrop
          label="Image héros (paysage)"
          aspect={16/9}
          initialPreview={heroImagePreview}
          onImageChange={handleHeroImageChange}
          description="Image au format paysage (16:9) pour la section héros"
          maxSizeMB={1.5}
        />

        <ImageUploadWithCrop
          label="Image de l'invitation (paysage)"
          aspect={16/9}
          initialPreview={invitationImagePreview}
          onImageChange={handleInvitationImageChange}
          description="Image au format paysage (16:9) pour l'invitation téléchargeable"
          maxSizeMB={1.5}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-600 transition disabled:opacity-50 active:scale-[0.98] touch-manipulation"
          style={{ touchAction: "manipulation" }}
        >
          {isSubmitting ? "Enregistrement..." : isEdit ? "Modifier l'événement" : "Créer l'événement"}
        </button>
      </form>
    </div>
  );
}