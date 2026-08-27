import { useRouter } from "next/navigation";
import { Wallet, Plus, CreditCard, ArrowDownRight } from "lucide-react";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  currency: string;
  createdAt: Date;
};

interface ProfileWalletCardProps {
  balance: number;
  transactions: Transaction[];
  formatCurrency: (amount: number) => string;
}

export function ProfileWalletCard({
  balance,
  transactions,
  formatCurrency,
}: ProfileWalletCardProps) {
  const router = useRouter();

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Wallet size={18} className="text-blue-500" />
          Portefeuille
        </h3>
        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
          Actif
        </span>
      </div>

      <div className="text-center mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">Solde disponible</p>
        <p className="text-4xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(balance)}
        </p>
      </div>

      <button
        onClick={() => router.push("/tarifs")}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition text-sm font-medium"
      >
        <Plus size={16} />
        Déposer des fonds
      </button>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <CreditCard size={14} />
          Dernières transactions
        </h4>
        {transactions.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">Aucune transaction.</p>
        ) : (
          <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <div className="flex items-center gap-2">
                  {tx.type === "deposit" && <ArrowDownRight size={14} className="text-green-500" />}
                  {tx.type === "payment" && <CreditCard size={14} className="text-blue-500" />}
                  <span className="text-gray-700 dark:text-gray-300">
                    {tx.type === "deposit" ? "Dépôt" : "Paiement"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-medium ${tx.type === "deposit" ? "text-green-600" : "text-blue-600"}`}>
                    {tx.type === "deposit" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(tx.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}