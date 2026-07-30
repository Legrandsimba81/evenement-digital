import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Eye,
  Check,
  X,
  Search,
  Filter,
} from "lucide-react";
import TransactionActions from "@/components/admin/TransactionActions";
import AdminTransactionsClient from "./AdminTransactionsClient";

export const dynamic = "force-dynamic";

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: { status?: string; operator?: string; search?: string };
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const statusFilter = searchParams.status || "all";
  const operatorFilter = searchParams.operator || "all";
  const searchQuery = searchParams.search?.trim() || "";

  // Construire le filtre
  const where: any = {};
  if (statusFilter !== "all") where.status = statusFilter;
  if (operatorFilter !== "all") where.operator = operatorFilter;
  if (searchQuery) {
    where.OR = [
      { user: { name: { contains: searchQuery, mode: "insensitive" } } },
      { user: { email: { contains: searchQuery, mode: "insensitive" } } },
      { fullName: { contains: searchQuery, mode: "insensitive" } },
      { phoneNumber: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  const stats = {
    total: transactions.length,
    pending: transactions.filter((t) => t.status === "pending").length,
    completed: transactions.filter((t) => t.status === "completed").length,
    failed: transactions.filter((t) => t.status === "failed").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/admin"
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestion des transactions
          </h1>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">En attente</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Validées</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Rejetées</p>
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          </div>
        </div>

        {/* Filtres et recherche (composant client) */}
        <AdminTransactionsClient
          transactions={transactions}
          statusFilter={statusFilter}
          operatorFilter={operatorFilter}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}