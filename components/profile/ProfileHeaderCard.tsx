"use client";

import { Calendar, Edit, Mail, Phone, User, AlertTriangle } from "lucide-react";
import { resendVerificationEmail } from "@/actions/email-verification";
import { useState } from "react";

type UserType = {
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  createdAt: Date;
  emailVerified: Date | null;
};

interface ProfileHeaderCardProps {
  user: UserType;
  formatDate: (date: Date) => string;
  onOpenPhoneModal: () => void;
}

export function ProfileHeaderCard({
  user,
  formatDate,
  onOpenPhoneModal,
}: ProfileHeaderCardProps) {
  const [resendLoading, setResendLoading] = useState(false);
  const isEmailVerified = !!user.emailVerified;

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      await resendVerificationEmail();
      alert("Un nouvel email de vérification a été envoyé.");
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'envoi.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!user.phone && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-start gap-3">
          <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Numéro de téléphone manquant
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Pour recevoir des notifications et faciliter vos paiements, ajoutez votre numéro de téléphone.
            </p>
            <button
              onClick={onOpenPhoneModal}
              className="mt-1 text-sm font-medium text-yellow-800 dark:text-yellow-200 underline hover:no-underline"
            >
              Ajouter maintenant
            </button>
          </div>
        </div>
      )}

      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50">
        <div className="flex items-start gap-6">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {user.name || "Utilisateur"}
            </h2>
            <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-blue-500" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-blue-500" />
                <span>{user.phone || "Non renseigné"}</span>
                <button
                  onClick={onOpenPhoneModal}
                  className="ml-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  <Edit size={14} />
                  {user.phone ? "Modifier" : "Ajouter"}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} className="text-blue-500" />
                <span>Rôle : {user.role}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" />
                <span>Membre depuis le {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isEmailVerified ? (
                <span className="text-green-600">Email vérifié</span>
              ) : (
                <span className="text-yellow-600">Email non vérifié</span>
              )}
            </div>
            {!isEmailVerified && (
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="text-sm text-blue-600 hover:underline disabled:opacity-50"
              >
                {resendLoading ? "Envoi..." : "Renvoyer l'email de vérification"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}