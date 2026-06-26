"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<{ id: number; x: number; size: number; duration: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHearts((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          x: Math.random() * 100,
          size: 16 + Math.random() * 24,
          duration: 8 + Math.random() * 8,
        },
      ]);
      if (hearts.length > 15) {
        setHearts((prev) => prev.slice(1));
      }
    }, 800);

    return () => clearInterval(interval);
  }, [hearts.length]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <Heart
          key={heart.id}
          className="absolute text-pink-500/50"
          style={{
            left: `${heart.x}%`,
            top: "-10%",
            fontSize: heart.size,
            animation: `floatDown ${heart.duration}s linear forwards`,
            opacity: 0.7,
          }}
          fill="currentColor"
        />
      ))}
      <style jsx>{`
        @keyframes floatDown {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.7;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}