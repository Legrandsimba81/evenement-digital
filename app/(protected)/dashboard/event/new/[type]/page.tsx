// app/(protected)/dashboard/event/new/[type]/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ThemeSelector from "@/components/events/ThemeSelector";

export default async function EventNewTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ theme?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { type } = await params;
  const { theme } = await searchParams;

  const validTypes = ["ANNIVERSAIRE", "MARIAGE", "SOUTENANCE", "AUTRE"];
  if (!validTypes.includes(type)) redirect("/dashboard/event/new");

  // Si aucun thème n'est sélectionné, afficher le sélecteur de thème
  if (!theme || theme === "choose") {
    return <ThemeSelector type={type as any} />;
  }

  // Sinon, afficher le formulaire avec le thème pré-rempli
  const EventTypeForm = (await import("@/components/events/EventTypeForm")).default;
  return <EventTypeForm type={type as any} themeId={theme} />;
}