import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CreateFairePartForm from "@/components/faire-part/CreateFairePartForm";

export default async function NewFairePartPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-md border border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Créer un nouveau Faire-Part
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Renseignez toutes les informations indispensables pour générer votre faire-part numérique et son PDF.
        </p>
        <CreateFairePartForm />
      </div>
    </div>
  );
}