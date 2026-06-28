"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, CheckCircle, Users, User, Camera } from "lucide-react";
import { updateGuestStatus } from "@/actions/guest-actions";
import dynamic from "next/dynamic";

const QrReader = dynamic(() => import("react-qr-scanner").then(mod => mod.default), {
  ssr: false,
});

type Guest = {
  id: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  status?: string | null;
  invitationNumber?: string | null;
  invitationType?: string | null;
};

type Event = {
  id: string;
  title: string;
  slug: string;
  guests: Guest[];
  gateSecret?: string | null;
};

export default function GateClient({ event }: { event: Event }) {
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const filteredGuests = event.guests.filter(
    (g) =>
      g.firstName.toLowerCase().includes(search.toLowerCase()) ||
      g.lastName.toLowerCase().includes(search.toLowerCase()) ||
      g.invitationNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const handleValidateEntry = (guestId: string) => {
    startTransition(async () => {
      await updateGuestStatus(guestId, "entre");
      router.refresh();
    });
  };

  const handleScan = (result: { text: string } | null) => {
    if (result?.text) {
      const data = result.text;
      setScanResult(data);
      try {
        const url = new URL(data);
        const pathname = url.pathname;

        // Cas 1 : QR d'invitation classique (contient firstName et lastName)
        const firstName = url.searchParams.get("firstName");
        const lastName = url.searchParams.get("lastName");

        if (firstName && lastName) {
          const guest = event.guests.find(
            (g) =>
              g.firstName.toLowerCase() === firstName.toLowerCase() &&
              g.lastName.toLowerCase() === lastName.toLowerCase()
          );
          if (guest) {
            if (guest.status === "entre") {
              alert(`✅ ${guest.firstName} ${guest.lastName} est déjà entré.`);
            } else if (guest.status === "annule") {
              alert(`❌ ${guest.firstName} ${guest.lastName} a annulé sa présence.`);
            } else {
              if (confirm(`Valider l'entrée de ${guest.firstName} ${guest.lastName} ?`)) {
                handleValidateEntry(guest.id);
              }
            }
          } else {
            alert("❌ Invité non trouvé. Vérifiez le nom dans le QR.");
          }
          setScanning(false);
          return;
        }

        // Cas 2 : QR de contrôle (gate-scan) avec g et s
        const guestId = url.searchParams.get("g");
        const secret = url.searchParams.get("s");
        if (guestId && secret && event.gateSecret === secret) {
          const guest = event.guests.find((g) => g.id === guestId);
          if (guest) {
            if (guest.status === "entre") {
              alert(`✅ ${guest.firstName} ${guest.lastName} est déjà entré.`);
            } else if (guest.status === "annule") {
              alert(`❌ ${guest.firstName} ${guest.lastName} a annulé sa présence.`);
            } else {
              if (confirm(`Valider l'entrée de ${guest.firstName} ${guest.lastName} ?`)) {
                handleValidateEntry(guest.id);
              }
            }
          } else {
            alert("❌ Invité non trouvé.");
          }
          setScanning(false);
          return;
        }

        alert("QR code invalide : paramètres manquants.");
        setScanning(false);
      } catch (error) {
        alert("QR code invalide.");
        setScanning(false);
      }
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    alert("Erreur du scanner. Réessayez.");
    setScanning(false);
  };

  const statusColors: Record<string, string> = {
    en_attente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    attending: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    annule: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    entre: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  };

  const statusLabels: Record<string, string> = {
    en_attente: "En attente",
    attending: "Confirmé",
    annule: "Annulé",
    entre: "Entré",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Contrôle d'accès
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{event.title}</p>
        </div>

        <div className="mb-6 p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Scanner un QR d'invitation
            </h2>
            <button
              onClick={() => setScanning(!scanning)}
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl transition"
            >
              <Camera size={18} />
              {scanning ? "Arrêter" : "Scanner"}
            </button>
          </div>
          {scanning && (
            <div className="relative aspect-square max-w-sm mx-auto overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">
              <QrReader
                onResult={handleScan}
                onError={handleError}
                constraints={{ facingMode: "environment" } as any} // ✅ Correction TypeScript
                className="w-full h-full"
              />
            </div>
          )}
          {scanResult && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Dernier scan : {scanResult}
            </div>
          )}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom ou numéro d'invitation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left">N°</th>
                  <th className="px-4 py-3 text-left">Nom</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Statut</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500 dark:text-gray-400">
                      Aucun invité trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredGuests.map((guest) => {
                    const statusKey = guest.status || "en_attente";
                    const colorClass = statusColors[statusKey] || statusColors.en_attente;
                    const label = statusLabels[statusKey] || "En attente";
                    const isEntered = statusKey === "entre";
                    const isCancelled = statusKey === "annule";

                    return (
                      <tr
                        key={guest.id}
                        className={`border-b dark:border-gray-700 ${
                          isEntered ? "bg-green-50 dark:bg-green-900/10" : ""
                        }`}
                      >
                        <td className="px-4 py-3 font-mono font-semibold">
                          {guest.invitationNumber || "—"}
                        </td>
                        <td className="px-4 py-3">
                          {guest.title ? `${guest.title} ${guest.firstName} ${guest.lastName}` : `${guest.firstName} ${guest.lastName}`}
                        </td>
                        <td className="px-4 py-3">
                          {guest.invitationType === "couple" ? (
                            <span className="flex items-center gap-1 text-purple-600">
                              <Users size={14} /> Couple
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-blue-600">
                              <User size={14} /> Seul
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                            {label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {isEntered ? (
                            <span className="text-green-600 font-medium flex items-center gap-1">
                              <CheckCircle size={16} /> Déjà entré
                            </span>
                          ) : isCancelled ? (
                            <span className="text-red-500 font-medium">Annulé</span>
                          ) : (
                            <button
                              onClick={() => handleValidateEntry(guest.id)}
                              disabled={isPending}
                              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl transition disabled:opacity-50 text-sm"
                            >
                              Valider l'entrée
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full bg-yellow-400"></span> En attente</span>
          <span className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span> Entré</span>
          <span className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full bg-red-500"></span> Annulé</span>
          <span className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full bg-green-500"></span> Confirmé</span>
        </div>
      </div>
    </div>
  );
}