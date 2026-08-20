"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateEvent } from "@/actions/event-actions";
import LocationForm from "./LocationForm";
import { Loader2 } from "lucide-react";

export default function LocationManager({ event }: { event: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [locationData, setLocationData] = useState({
    locationName: event.locationName || "",
    locationAddress: event.locationAddress || "",
    locationLat: event.locationLat || null,
    locationLng: event.locationLng || null,
    locationUrl: event.locationUrl || "",
  });

  const handleUpdate = (data: any) => {
    setLocationData(data);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await updateEvent(event.slug, locationData);
      setSuccess(true);
      setTimeout(() => router.refresh(), 1000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <LocationForm initialData={locationData} onUpdate={handleUpdate} isSubmitting={loading} />
      {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}
      {success && <div className="mt-4 text-green-600 text-sm">✅ Lieu mis à jour avec succès !</div>}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-6 w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-6 rounded-xl transition disabled:opacity-50"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : "Enregistrer les modifications"}
      </button>
    </div>
  );
}