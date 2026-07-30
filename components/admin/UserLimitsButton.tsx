"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import UserLimitsModal from "./UserLimitsModal";

interface UserLimitsButtonProps {
  userId: string;
  currentLimits: Record<string, number | null> | null;
  userName: string;
}

export default function UserLimitsButton({
  userId,
  currentLimits,
  userName,
}: UserLimitsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition text-blue-500 hover:text-blue-700"
        title="Gérer les limites d'invités"
      >
        <Settings size={16} />
      </button>
      {isOpen && (
        <UserLimitsModal
          userId={userId}
          currentLimits={currentLimits}
          userName={userName}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}