import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getEventLogs } from "@/actions/log-actions";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function EventLogsPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { eventSlug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    include: { user: true },
  });
  if (!event) redirect("/dashboard");

  const logs = await getEventLogs(event.id);

  const actionLabels: Record<string, string> = {
    ADDED_GUEST: "a ajouté un invité",
    REMOVED_GUEST: "a supprimé un invité",
    VALIDATED_ENTRY: "a validé l'entrée",
    UPDATED_EVENT: "a modifié l'événement",
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Historique des modifications – {event.title}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Toutes les actions effectuées sur cet événement.
      </p>

      {logs.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Aucune modification enregistrée pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  <span className="text-primary-500 font-semibold">
                    {log.user.name || log.user.email}
                  </span>
                  {" "}
                  <span className="text-gray-600 dark:text-gray-300">{actionLabels[log.action] || log.action}</span>
                </p>
                {log.details && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{log.details}</p>
                )}
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                {format(new Date(log.createdAt), "dd MMM yyyy • HH:mm", { locale: fr })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}