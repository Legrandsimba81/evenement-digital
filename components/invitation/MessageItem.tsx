"use client";

import { useTransition, useState } from "react";
import { Trash2, Pencil, X, Check } from "lucide-react";
import { deleteMessage, updateMessage } from "@/actions/message-actions";

type MessageItemProps = {
  message: {
    id: string;
    content: string;
    guestName: string;
    guestId?: string | null;
    createdAt: string;
  };
  currentGuestId?: string;
  currentGuestName?: string;
  isOrganizer?: boolean;
  eventId: string;
};

export default function MessageItem({
  message,
  currentGuestId,
  currentGuestName,
  isOrganizer = false,
  eventId,
}: MessageItemProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  const canDelete =
    (isOrganizer && true) ||
    (currentGuestId &&
      (message.guestId === currentGuestId ||
        (!message.guestId && currentGuestName && message.guestName === currentGuestName)));

  const handleDelete = () => {
    if (confirm("Supprimer ce message ?")) {
      startTransition(async () => {
        await deleteMessage(message.id, currentGuestId, isOrganizer);
      });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(message.content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(message.content);
  };

  const handleSaveEdit = () => {
    if (editedContent.trim() === message.content) {
      setIsEditing(false);
      return;
    }
    startTransition(async () => {
      await updateMessage(message.id, editedContent.trim(), isOrganizer);
      setIsEditing(false);
    });
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
          {isOrganizer && (
            <button
              onClick={handleEdit}
              disabled={isPending || isEditing}
              className="text-blue-500 hover:text-blue-700 transition disabled:opacity-50"
              title="Modifier"
            >
              <Pencil size={16} />
            </button>
          )}
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
      {isEditing ? (
        <div className="mt-2 space-y-2">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            rows={2}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={isPending}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition disabled:opacity-50"
            >
              <Check size={16} /> Enregistrer
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isPending}
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition"
            >
              <X size={16} /> Annuler
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-700 dark:text-gray-300 mt-1">{message.content}</p>
      )}
    </div>
  );
}