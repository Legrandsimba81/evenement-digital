"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteMessage } from "@/actions/message-actions";

type MessageItemProps = {
  message: {
    id: string;
    content: string;
    guestName: string;
    guestId?: string | null;
    createdAt: string;
  };
  currentGuestId?: string; // pour l'invité
  isOrganizer?: boolean;   // pour l'organisateur (quand connecté)
  eventId: string;
};

export default function MessageItem({ message, currentGuestId, isOrganizer = false, eventId }: MessageItemProps) {
  const [isPending, startTransition] = useTransition();

  const canDelete =
    (isOrganizer && true) || (currentGuestId && message.guestId === currentGuestId);

  const handleDelete = () => {
    if (confirm("Supprimer ce message ?")) {
      startTransition(async () => {
        await deleteMessage(message.id, currentGuestId, isOrganizer);
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 relative">
      <div className="flex items-center justify-between flex-wrap gap-1">
        <p className="font-semibold text-gray-900 dark:text-white">
          {message.guestName}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {new Date(message.createdAt).toLocaleDateString('fr-FR')}
          </span>
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-red-500 hover:text-red-700 transition disabled:opacity-50"
              title="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      <p className="text-gray-700 dark:text-gray-300 mt-1">{message.content}</p>
    </div>
  );
}