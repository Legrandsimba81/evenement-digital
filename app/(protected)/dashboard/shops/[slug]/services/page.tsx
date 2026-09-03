"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calculator,
  Printer,
  Sparkles,
  CheckCircle,
  FileText,
  User,
  Calendar,
} from "lucide-react";

// Types pour le devis
interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unitType?: string; // ex: 'heures', 'couverts', 'jours', 'pièces'
}

export default function ShopServicesPage({
  params,
}: {
  params: { slug: string };
}) {
  // Information client pour le devis
  const [clientName, setClientName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("Mariage");
  const [guestCount, setGuestCount] = useState<number>(100);

  // Catégorie sélectionnée pour simuler l'adaptation du type de devis
  const [categorySlug, setCategorySlug] = useState("photographe");

  // Liste des lignes de tarification du devis
  const [items, setItems] = useState<QuoteItem[]>([
    {
      id: "1",
      description: "Prestation de base (Couverture de l'événement)",
      quantity: 1,
      unitPrice: 300,
      unitType: "forfait",
    },
  ]);

  // Ajouter une ligne au devis
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        description: "",
        quantity: 1,
        unitPrice: 0,
        unitType: getUnitLabelByCategory(categorySlug),
      },
    ]);
  };

  // Mettre à jour une ligne
  const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Supprimer une ligne
  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Calcul du sous-total et du total
  const subtotal = items.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0
  );
  const total = subtotal;

  // Détermine les unités par défaut selon la catégorie
  function getUnitLabelByCategory(slug: string) {
    if (["traiteur"].includes(slug)) return "couverts";
    if (["salle", "hotel", "bar"].includes(slug)) return "journée/heures";
    if (["decorateur", "fleuriste", "location-mobilier", "location-audiovisuel", "imprimerie"].includes(slug))
      return "unités";
    return "forfait/heures";
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href={`/dashboard/shops/${params.slug}`}
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition mb-2"
            >
              <ArrowLeft size={16} />
              Retour au tableau de bord
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="text-emerald-600" /> Générateur de Devis Événementiel
            </h1>
          </div>

          {/* Simulateur de catégorie pour la démo */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-800 text-sm">
            <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">
              Mode catégorie :
            </span>
            <select
              value={categorySlug}
              onChange={(e) => {
                setCategorySlug(e.target.value);
                setItems([
                  {
                    id: Date.now().toString(),
                    description: "Prestation principale",
                    quantity: 1,
                    unitPrice: 150,
                    unitType: getUnitLabelByCategory(e.target.value),
                  },
                ]);
              }}
              className="bg-transparent text-gray-800 dark:text-white font-medium focus:outline-none"
            >
              <option value="photographe">Photographe / Vidéaste</option>
              <option value="traiteur">Traiteur / Resto</option>
              <option value="salle">Salle / Espace</option>
              <option value="decorateur">Décorateur / Fleuriste / Matériel</option>
              <option value="dj">DJ / Animation / Artiste</option>
            </select>
          </div>
        </div>

        {/* Formulaire Informations Événement & Client */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <User size={18} className="text-blue-500" />
            Détails de la demande
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Nom du Client / Organisateur
              </label>
              <input
                type="text"
                placeholder="ex: Jean Dupont"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Date de l'événement
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Type d'événement
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none"
              >
                <option value="Mariage">Mariage</option>
                <option value="Anniversaire">Anniversaire</option>
                <option value="Gala / Soirée">Gala / Soirée</option>
                <option value="Corporate / Conférence">Corporate / Conférence</option>
                <option value="Concert / Spectacle">Concert / Spectacle</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Nombre estimé d'invités
              </label>
              <input
                type="number"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Structure dynamique des prestations selon la catégorie */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calculator size={18} className="text-emerald-500" /> Prestations & Calcul des coûts
            </h2>
            <button
              onClick={addItem}
              className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-3 py-2 rounded-xl font-medium transition"
            >
              <Plus size={14} /> Ajouter une ligne
            </button>
          </div>

          {/* Liste des postes de dépenses */}
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    placeholder="Description de la prestation / matériel..."
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, "quantity", Number(e.target.value))
                      }
                      className="w-full px-2 py-2 text-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <span className="text-xs text-gray-400 min-w-[50px]">
                    {item.unitType || "unités"}
                  </span>

                  <div className="w-28">
                    <input
                      type="number"
                      placeholder="Prix unit."
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(item.id, "unitPrice", Number(e.target.value))
                      }
                      className="w-full px-2 py-2 text-right rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="w-24 text-right font-bold text-sm text-gray-800 dark:text-gray-200">
                    {(item.quantity * item.unitPrice).toLocaleString()} $
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Résumé du Total */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Devis généré pour {guestCount} invités ({eventType})
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                Montant total estimé :
              </span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {total.toLocaleString()} $
              </span>
            </div>
          </div>
        </div>

        {/* Actions sur le devis */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-medium px-5 py-3 rounded-2xl transition text-sm"
          >
            <Printer size={18} /> Imprimer / PDF
          </button>
          <button
            onClick={() => alert("Devis prêt à être envoyé au client !")}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 rounded-2xl transition shadow-sm text-sm"
          >
            <CheckCircle size={18} /> Valider & Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}