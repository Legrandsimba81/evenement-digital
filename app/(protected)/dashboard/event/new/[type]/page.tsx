import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ThemeSelector from "@/components/events/ThemeSelector";

export default async function EventNewTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ theme?: string; returnTo?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { type } = await params;
  const { theme, returnTo } = await searchParams;

  const validTypes = ["ANNIVERSAIRE", "MARIAGE", "SOUTENANCE", "AUTRE"];
  if (!validTypes.includes(type)) redirect("/dashboard/event/new");

  // Si aucun thème sélectionné, afficher le sélecteur
  if (!theme) {
    return <ThemeSelector type={type as any} returnTo={returnTo} />;
  }

  // Si on a un thème et un returnTo, rediriger vers returnTo avec le thème
  if (returnTo) {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const url = new URL(returnTo, baseUrl);
    url.searchParams.set("theme", theme);
    redirect(url.toString());
  }

  // Cas standard : création normale
  const EventForm = (await import("@/components/events/EventForm")).default;
  return <EventForm type={type as any} themeId={theme} />;
}