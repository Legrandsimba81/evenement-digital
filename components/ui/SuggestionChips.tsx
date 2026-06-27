"use client";

import { useState } from "react";

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SuggestionChips({
  suggestions,
  onSelect,
  placeholder,
  className = "",
}: SuggestionChipsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <div
        className="flex flex-wrap gap-2 mt-1 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {placeholder || "Suggestions :"}
        </span>
        {suggestions.slice(0, 3).map((suggestion, index) => (
          <span
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(suggestion);
            }}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 dark:from-primary-900/30 dark:to-secondary-900/30 dark:text-primary-300 border border-primary-200 dark:border-primary-800 cursor-pointer hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {suggestion}
          </span>
        ))}
        {suggestions.length > 3 && (
          <span className="text-sm text-primary-500 hover:underline">
            +{suggestions.length - 3}
          </span>
        )}
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-2 p-3 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-md">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <span
                key={index}
                onClick={() => {
                  onSelect(suggestion);
                  setIsOpen(false);
                }}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 dark:from-primary-900/30 dark:to-secondary-900/30 dark:text-primary-300 border border-primary-200 dark:border-primary-800 cursor-pointer hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {suggestion}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}