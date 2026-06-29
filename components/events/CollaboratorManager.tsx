"use client";

import { useState, useTransition, useEffect } from "react";
import { addCollaborator, removeCollaborator, getCollaborators } from "@/actions/collaborator-actions";
import { UserPlus, Trash2, Mail, User } from "lucide-react";

type Collaborator = {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

export default function CollaboratorManager({
  eventId,
  eventSlug,
  isOwner,
}: {
  eventId: string;
  eventSlug: string;
  isOwner: boolean;
}) {
  const [email, setEmail] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]); // ✅ type corrigé
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadCollaborators();
  }, [eventId]);

  const loadCollaborators = async () => {
    setLoading(true);
    try {
      const data = await getCollaborators(eventId);
      setCollaborators(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email.trim()) return;

    startTransition(async () => {
      try {
        await addCollaborator(eventId, email.trim());
        setSuccess(`Collaborateur ajouté : ${email}`);
        setEmail("");
        await loadCollaborators();
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  const handleRemove = async (userId: string) => {
    if (!confirm("Retirer ce collaborateur ?")) return;
    startTransition(async () => {
      try {
        await removeCollaborator(eventId, userId);
        await loadCollaborators();
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm">
          {success}
        </div>
      )}

      {isOwner && (
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email du collaborateur"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl transition disabled:opacity-50"
          >
            <UserPlus size={18} />
            {isPending ? "Ajout..." : "Ajouter"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-center py-6 text-gray-500">Chargement...</p>
      ) : collaborators.length === 0 ? (
        <p className="text-center py-6 text-gray-500">Aucun collaborateur pour le moment.</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {collaborators.map((collab) => (
            <li key={collab.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {collab.user.image ? (
                  <img
                    src={collab.user.image}
                    alt={collab.user.name || ""}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <User size={20} className="text-gray-500 dark:text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {collab.user.name || "Utilisateur"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{collab.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {collab.role}
                </span>
                {isOwner && (
                  <button
                    onClick={() => handleRemove(collab.userId)}
                    disabled={isPending}
                    className="text-red-500 hover:text-red-700 transition disabled:opacity-50"
                    title="Retirer"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}