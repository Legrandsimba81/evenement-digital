"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addCollaborator, removeCollaborator } from "@/actions/collaborator-actions";
import { Loader2, UserPlus, UserMinus, User } from "lucide-react";

type Collaborator = {
  id: string;
  userId: string;
  name: string | null;
  email: string | null;
};

type Owner = {
  id: string;
  name: string | null;
};

export default function CollaboratorManager({
  eventId,
  eventSlug,
  isOwner,
  initialCollaborators = [],
  initialOwner = null,
}: {
  eventId: string;
  eventSlug: string;
  isOwner: boolean;
  initialCollaborators: Collaborator[];
  initialOwner: Owner | null;
}) {
  const router = useRouter();
  const [collaborators, setCollaborators] = useState<Collaborator[]>(initialCollaborators);
  const [owner] = useState<Owner | null>(initialOwner);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !isOwner) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const result = await addCollaborator(eventId, email.trim());
      if (result.success && result.collaborator) {
        // Ajouter le collaborateur à la liste locale
        setCollaborators((prev) => [...prev, result.collaborator as Collaborator]);
        setEmail("");
        setSuccess("Collaborateur ajouté avec succès !");
        router.refresh();
      } else {
        setError("Erreur lors de l'ajout.");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'ajout.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    if (!isOwner || !window.confirm("Retirer ce collaborateur ?")) return;
    setLoading(true);
    setError("");
    try {
      await removeCollaborator(eventId, collaboratorId);
      setCollaborators(collaborators.filter((c) => c.id !== collaboratorId));
      setSuccess("Collaborateur retiré.");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-3 rounded-xl">{success}</div>}

      {/* Propriétaire */}
      {owner && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <User size={20} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {owner.name || "Propriétaire"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Propriétaire de l'événement</p>
          </div>
        </div>
      )}

      {/* Liste des collaborateurs */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Collaborateurs ({collaborators.length})
        </h3>
        {collaborators.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Aucun collaborateur pour le moment.
          </p>
        ) : (
          <div className="space-y-2">
            {collaborators.map((collab) => (
              <div
                key={collab.id}
                className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <User size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {collab.name || "Utilisateur"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{collab.email}</p>
                  </div>
                </div>
                {isOwner && (
                  <button
                    onClick={() => handleRemove(collab.id)}
                    disabled={loading}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    title="Retirer"
                  >
                    <UserMinus size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulaire d'ajout (uniquement pour le propriétaire) */}
      {isOwner && (
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <input
            type="email"
            placeholder="Email du collaborateur"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            required
          />
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
            Ajouter
          </button>
        </form>
      )}
    </div>
  );
}