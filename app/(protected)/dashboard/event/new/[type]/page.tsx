import EventTypeForm from "@/components/events/EventTypeForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function EventNewTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { type } = await params;

  // Validation du type
  const validTypes = ["ANNIVERSAIRE", "MARIAGE", "SOUTENANCE", "AUTRE"];
  if (!validTypes.includes(type)) {
    redirect("/dashboard/event/new");
  }

  return <EventTypeForm type={type as any} />;
}