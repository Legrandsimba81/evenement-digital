"use client";

import { useState } from "react";
import PaymentModal from "./PaymentModal";
import CandidatePostForm from "./CandidatePostForm";

interface NewCandidatePostClientProps {
  user: { name?: string | null; email?: string | null };
  isEligibleForWelcomeBonus: boolean;
}

export default function NewCandidatePostClient({
  user,
  isEligibleForWelcomeBonus,
}: NewCandidatePostClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [hasValidatedPayment, setHasValidatedPayment] = useState(false);

  return (
    <>
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          setHasValidatedPayment(true);
        }}
        user={user}
      />

      {hasValidatedPayment ? (
        <CandidatePostForm isEligibleForWelcomeBonus={isEligibleForWelcomeBonus} />
      ) : (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-6 rounded-2xl text-center">
          <p className="text-sm text-amber-800 dark:text-amber-300 font-medium mb-3">
            Vous devez compléter vos coordonnées de paiement Mobile Money avant d'accéder au formulaire de rédaction.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors"
          >
            Renseigner mes coordonnées Airtel / Vodacom
          </button>
        </div>
      )}
    </>
  );
}