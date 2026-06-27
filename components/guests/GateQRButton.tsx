"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { QrCode, X } from "lucide-react";

export default function GateQRButton({ guest, event }: { guest: any; event: any }) {
  const [showModal, setShowModal] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
  const scanLink = `${baseUrl}/gate-scan?g=${guest.id}&s=${event.gateSecret}`;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-purple-500 hover:text-purple-700"
        title="QR de contrôle d'accès"
      >
        <QrCode size={16} />
      </button>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                QR contrôle - {guest.firstName} {guest.lastName}
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X size={20} className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <div className="flex justify-center">
              <QRCode value={scanLink} size={200} />
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
              Scannez ce QR à l'entrée avec la tablette de contrôle.
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(scanLink);
                alert("Lien copié !");
              }}
              className="mt-4 w-full bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl text-sm transition"
            >
              Copier le lien
            </button>
          </div>
        </div>
      )}
    </>
  );
}