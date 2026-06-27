"use client";
import { addMessage } from "@/actions/message-actions";
import { useRef } from "react";

export default function MessageForm({ eventId, guestName }: { eventId: string, guestName: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  async function handleAction(formData: FormData) {
    const content = formData.get("content") as string;
    await addMessage(eventId, guestName, content);
    formRef.current?.reset();
  }
  return (
    <form ref={formRef} action={handleAction} className="mt-4">
      <textarea name="content" placeholder="Hereux Mariage, anniversaire, Defence..." className="w-full p-2 border rounded" rows={3} required />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mt-2">Envoyer</button>
    </form>
  );
}