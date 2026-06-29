import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ThemeSelector from "@/components/events/ThemeSelector";

export default async function ThemePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { type } = await params;
  const validTypes = ["ANNIVERSAIRE", "MARIAGE", "SOUTENANCE", "AUTRE"];
  if (!validTypes.includes(type)) redirect("/dashboard/event/new");

  return <ThemeSelector type={type as any} />;
}