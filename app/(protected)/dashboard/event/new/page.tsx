import { auth } from "@/auth";
import { redirect } from "next/navigation";
import EventForm from "@/components/forms/EventForm";

export default async function NewEventPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Créer un nouvel événement</h1>
      <EventForm />
    </div>
  );
}