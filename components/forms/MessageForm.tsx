"use client";

import { addMessage } from "@/actions/message-actions";
import { useRef } from "react";

export default function MessageForm({ eventId, guestName, guestId }: { eventId: string; guestName: string; guestId?: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleAction = async (formData: FormData) => {
    const content = formData.get("content") as string;
    if (content.trim()) {
      await addMessage(eventId, guestName, content.trim(), guestId);
      formRef.current?.reset();
    }
  };

  return (
    <form ref={formRef} action={handleAction} className="space-y-4">
      <textarea
        name="content"
        placeholder="Écrivez votre message..."
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
        rows={3}
        required
      />
      <button
        type="submit"
        className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-3 rounded-xl transition"
      >
        Envoyer le message
      </button>
    </form>
  );
}