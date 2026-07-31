"use client";

import { useState, useEffect } from "react";
import { Send, Loader2, CheckCircle, XCircle, Users, User } from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default function AdminEmailsPage() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [target, setTarget] = useState<"all" | "specific">("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string | null; email: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) throw new Error("Erreur lors du chargement des utilisateurs");
        const data = await res.json();
        setUsers(data);
      } catch (err: any) {
        console.error(err);
        setError("Impossible de charger la liste des utilisateurs.");
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      const payload: any = {
        to: target,
        subject,
        html: content,
      };
      if (target === "specific") {
        payload.userIds = selectedUsers;
      }

      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur d'envoi");

      setCount(data.count);
      setSuccess(true);
      setSubject("");
      setContent("");
      setSelectedUsers([]);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const selectAll = () => {
    setSelectedUsers(users.map((u) => u.id));
  };

  const deselectAll = () => {
    setSelectedUsers([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Envoi d'emails</h1>
        <p className="text-gray-500 dark:text-gray-400">Envoyez un email personnalisé à un ou plusieurs utilisateurs.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 max-w-4xl">
        {/* Destinataires */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destinataires</label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="all"
                checked={target === "all"}
                onChange={() => setTarget("all")}
              />
              <span className="flex items-center gap-1"><Users size={16} /> Tous les utilisateurs</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="specific"
                checked={target === "specific"}
                onChange={() => setTarget("specific")}
              />
              <span className="flex items-center gap-1"><User size={16} /> Utilisateurs sélectionnés</span>
            </label>
          </div>
        </div>

        {target === "specific" && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sélectionnez les utilisateurs
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={selectAll} className="text-xs text-blue-600 hover:underline">Tout sélectionner</button>
                <button type="button" onClick={deselectAll} className="text-xs text-blue-600 hover:underline">Tout désélectionner</button>
              </div>
            </div>
            {loadingUsers ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={24} className="animate-spin text-blue-500" />
              </div>
            ) : (
              <>
                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-1">
                  {users.map((user) => (
                    <label key={user.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUser(user.id)}
                      />
                      <span>{user.name || "Anonyme"} ({user.email})</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedUsers.length} utilisateur(s) sélectionné(s)
                </p>
              </>
            )}
          </div>
        )}

        {/* Sujet */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sujet</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            placeholder="Sujet de l'email"
          />
        </div>

        {/* Contenu avec éditeur riche */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contenu</label>
          <RichTextEditor value={content} onChange={setContent} placeholder="Saisissez votre message ici..." />
        </div>

        {/* Bouton */}
        <button
          type="submit"
          disabled={loading || (target === "specific" && selectedUsers.length === 0)}
          className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send size={18} />
              Envoyer l'email
            </>
          )}
        </button>

        {/* Messages */}
        {success && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 flex items-center gap-2">
            <CheckCircle size={20} />
            <span>Email envoyé avec succès à {count} destinataire(s).</span>
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-2">
            <XCircle size={20} />
            <span>{error}</span>
          </div>
        )}
      </form>
    </div>
  );
}