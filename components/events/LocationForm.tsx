"use client";

import { useState, useEffect } from "react";
import { MapPin, Globe, Loader2 } from "lucide-react";

interface LocationFormProps {
  initialData?: {
    locationName?: string | null;
    locationAddress?: string | null;
    locationLat?: number | null;
    locationLng?: number | null;
    locationUrl?: string | null;
  };
  onUpdate: (data: any) => void;
  isSubmitting?: boolean;
}

export default function LocationForm({ initialData, onUpdate, isSubmitting }: LocationFormProps) {
  const [locationName, setLocationName] = useState(initialData?.locationName || "");
  const [locationAddress, setLocationAddress] = useState(initialData?.locationAddress || "");
  const [locationLat, setLocationLat] = useState<number | null>(initialData?.locationLat || null);
  const [locationLng, setLocationLng] = useState<number | null>(initialData?.locationLng || null);
  const [locationUrl, setLocationUrl] = useState(initialData?.locationUrl || "");
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Met à jour les coordonnées automatiquement via l'API de géocodage (ex: OpenStreetMap)
  const geocodeAddress = async (address: string) => {
    if (!address.trim()) return;
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        setLocationLat(parseFloat(data[0].lat));
        setLocationLng(parseFloat(data[0].lon));
      }
    } catch (error) {
      console.error("Erreur de géocodage :", error);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Soumettre les données à chaque changement
  useEffect(() => {
    const data = {
      locationName: locationName || undefined,
      locationAddress: locationAddress || undefined,
      locationLat: locationLat || undefined,
      locationLng: locationLng || undefined,
      locationUrl: locationUrl || undefined,
    };
    onUpdate(data);
  }, [locationName, locationAddress, locationLat, locationLng, locationUrl, onUpdate]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du lieu</label>
        <input
          type="text"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="Ex: Salle des fêtes La Fontaine"
          className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse complète</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={locationAddress}
            onChange={(e) => setLocationAddress(e.target.value)}
            placeholder="Ex: 12 Avenue de la Liberté, Kinshasa"
            className="flex-1 mt-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="button"
            onClick={() => geocodeAddress(locationAddress)}
            disabled={!locationAddress.trim() || isGeocoding}
            className="mt-1 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition disabled:opacity-50"
          >
            {isGeocoding ? <Loader2 size={18} className="animate-spin" /> : "📍"}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-400">Cliquez sur l’icône pour obtenir les coordonnées automatiquement.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Latitude</label>
          <input
            type="number"
            step="any"
            value={locationLat ?? ""}
            onChange={(e) => setLocationLat(e.target.value ? parseFloat(e.target.value) : null)}
            className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Longitude</label>
          <input
            type="number"
            step="any"
            value={locationLng ?? ""}
            onChange={(e) => setLocationLng(e.target.value ? parseFloat(e.target.value) : null)}
            className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lien vers Google Maps (optionnel)</label>
        <input
          type="url"
          value={locationUrl}
          onChange={(e) => setLocationUrl(e.target.value)}
          placeholder="https://maps.google.com/..."
          className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
        />
      </div>
    </div>
  );
}