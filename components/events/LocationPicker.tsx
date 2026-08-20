"use client";

import { useState, useEffect } from "react";
import { MapPin, X, Loader2 } from "lucide-react";

interface LocationPickerProps {
  initialAddress?: string;
  initialLat?: number | null;
  initialLng?: number | null;
  initialName?: string;
  onLocationChange: (data: {
    address: string;
    lat: number | null;
    lng: number | null;
    name: string;
  }) => void;
}

export default function LocationPicker({
  initialAddress = "",
  initialLat = null,
  initialLng = null,
  initialName = "",
  onLocationChange,
}: LocationPickerProps) {
  const [address, setAddress] = useState(initialAddress);
  const [name, setName] = useState(initialName);
  const [lat, setLat] = useState<number | null>(initialLat);
  const [lng, setLng] = useState<number | null>(initialLng);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  // Recherche de coordonnées à partir de l'adresse (géocodage via Nominatim)
  const searchLocation = async () => {
    if (!address.trim()) {
      setError("Veuillez saisir une adresse.");
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      const encodedAddress = encodeURIComponent(address);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const result = data[0];
        const latVal = parseFloat(result.lat);
        const lngVal = parseFloat(result.lon);
        setLat(latVal);
        setLng(lngVal);
        // Mettre à jour l'adresse avec le résultat formaté
        setAddress(result.display_name || address);

        onLocationChange({
          address: result.display_name || address,
          lat: latVal,
          lng: lngVal,
          name: name || result.display_name || "",
        });
      } else {
        setError("Aucun lieu trouvé pour cette adresse.");
        setLat(null);
        setLng(null);
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la recherche du lieu.");
    } finally {
      setIsSearching(false);
    }
  };

  // Obtention de la position actuelle du navigateur
  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas prise en charge par votre navigateur.");
      return;
    }

    setIsSearching(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);

        // Récupérer l'adresse à partir des coordonnées (reverse geocoding)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=18`
          );
          const data = await res.json();
          const addressText = data.display_name || `${latitude}, ${longitude}`;
          setAddress(addressText);
          onLocationChange({
            address: addressText,
            lat: latitude,
            lng: longitude,
            name: name || "Position actuelle",
          });
        } catch (err) {
          console.error(err);
          setAddress(`${latitude}, ${longitude}`);
          onLocationChange({
            address: `${latitude}, ${longitude}`,
            lat: latitude,
            lng: longitude,
            name: name || "Position actuelle",
          });
        }
        setIsSearching(false);
      },
      (err) => {
        setError("Impossible d'obtenir votre position. Vérifiez les permissions.");
        setIsSearching(false);
        console.error(err);
      }
    );
  };

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nom du lieu
          </label>
          <input
            type="text"
            placeholder="Ex: Salle des fêtes La Fontaine"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              onLocationChange({ address, lat, lng, name: e.target.value });
            }}
            className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Adresse complète
        </label>
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            placeholder="Ex: Avenue de la Révolution, Kinshasa"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setLat(null);
              setLng(null);
            }}
            className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={searchLocation}
            disabled={isSearching || !address.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition disabled:opacity-50 flex items-center gap-1"
          >
            {isSearching ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
            <span className="hidden sm:inline">Rechercher</span>
          </button>
          <button
            onClick={getCurrentPosition}
            disabled={isSearching}
            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition disabled:opacity-50"
            title="Utiliser ma position"
          >
            📍
          </button>
        </div>
        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>

      {(lat !== null && lng !== null) && (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <p>Coordonnées : {lat.toFixed(6)}, {lng.toFixed(6)}</p>
        </div>
      )}

      {/* Afficher une miniature de carte (via OpenStreetMap) */}
      {(lat !== null && lng !== null) && (
        <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <img
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01}%2C${lat-0.01}%2C${lng+0.01}%2C${lat+0.01}&layer=mapnik&marker=${lat}%2C${lng}`}
            alt="Carte"
            className="w-full h-48 object-cover"
          />
        </div>
      )}
    </div>
  );
}