import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, basePath }: { currentPage: number; totalPages: number; basePath: string }) {
  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <Link
        href={`${basePath}?page=${currentPage - 1}`}
        className={`p-2 rounded-lg border border-gray-300 dark:border-gray-700 ${currentPage <= 1 ? "opacity-50 pointer-events-none" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
      >
        <ChevronLeft size={18} />
      </Link>
      <span className="text-sm text-gray-600 dark:text-gray-300">
        Page {currentPage} sur {totalPages}
      </span>
      <Link
        href={`${basePath}?page=${currentPage + 1}`}
        className={`p-2 rounded-lg border border-gray-300 dark:border-gray-700 ${currentPage >= totalPages ? "opacity-50 pointer-events-none" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
      >
        <ChevronRight size={18} />
      </Link>
    </div>
  );
}