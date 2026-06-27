"use client";

interface MessageSuggestionsProps {
  suggestions: string[];
}

export default function MessageSuggestions({ suggestions }: MessageSuggestionsProps) {
  const handleSuggestionClick = (suggestion: string) => {
    // Trouver le textarea dans le formulaire parent
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = suggestion;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          type="button"
          className="text-xs px-3 py-1 rounded-full bg-primary-100 text-primary-700 hover:bg-primary-200 transition dark:bg-primary-900/30 dark:text-primary-300"
          onClick={() => handleSuggestionClick(suggestion)}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}