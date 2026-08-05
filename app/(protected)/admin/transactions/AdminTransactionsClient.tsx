"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, X } from "lucide-react";
import TransactionActions from "@/components/admin/TransactionActions";

type Transaction = {
  id: string;
  userId: string;
  user: { id: string; name: string | null; email: string };
  type: string;
  operator: string | null;
  countryCode: string | null;
  phoneNumber: string | null;
  fullName: string | null;
  amount: number;
  currency: string;
  description: string | null;
  proofImage: string | null;
  status: string;
  createdAt: Date;
};

export default function AdminTransactionsClient({
  transactions,
  statusFilter,
  operatorFilter,
  searchQuery,
}: {
  transactions: Transaction[];
  statusFilter: string;
  operatorFilter: string;
  searchQuery: string;
}) {
  const router = useRouter();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const applyFilters = (status: string, operator: string, search: string) => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (operator !== "all") params.set("operator", operator);
    if (search) params.set("search", search);
    router.push(`/admin/transactions?${params.toString()}`);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const countryNames: Record<string, string> = {
    CD: "RDC",
    KE: "Kenya",
    UG: "Ouganda",
    TZ: "Tanzanie",
    RW: "Rwanda",
    BI: "Burundi",
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Barre de recherche et filtres */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-55">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur, téléphone..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters(statusFilter, operatorFilter, localSearch)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => applyFilters(e.target.value, operatorFilter, localSearch)}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="completed">Validées</option>
            <option value="failed">Rejetées</option>
          </select>

          <select
            value={operatorFilter}
            onChange={(e) => applyFilters(statusFilter, e.target.value, localSearch)}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les opérateurs</option>
            <option value="mpesa">M-Pesa</option>
            <option value="airtel">Airtel Money</option>
          </select>

          <button
            type="button"
            onClick={() => applyFilters(statusFilter, operatorFilter, localSearch)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Search size={16} /> Rechercher
          </button>

          <button
            onClick={() => {
              setLocalSearch("");
              applyFilters("all", "all", "");
            }}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-950/60 dark:text-gray-300">
          {searchQuery ? `Recherche active : “${searchQuery}”` : "Aucune recherche active"}
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        {transactions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">Aucune transaction trouvée</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Utilisateur</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Nom complet</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Montant</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Opérateur</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Téléphone</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Pays</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Statut</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Date</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {tx.user.name || "Anonyme"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{tx.user.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{tx.fullName || "—"}</td>
                  <td className="py-3 px-4 font-medium">
                    {tx.amount} {tx.currency}
                  </td>
                  <td className="py-3 px-4 capitalize">{tx.operator}</td>
                  <td className="py-3 px-4 text-xs">{tx.phoneNumber}</td>
                  <td className="py-3 px-4 text-xs">{countryNames[tx.countryCode || ""] || "—"}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        tx.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : tx.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {tx.status === "completed" ? "Validé" : tx.status === "pending" ? "En attente" : "Rejeté"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs whitespace-nowrap">
                    {formatDate(tx.createdAt)}
                  </td>
                  <td className="py-3 px-4">
                    <TransactionActions
                      transactionId={tx.id}
                      status={tx.status}
                      proofImage={tx.proofImage}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}