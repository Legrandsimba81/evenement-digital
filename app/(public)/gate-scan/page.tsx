// app/(public)/gate-scan/page.tsx
import { Suspense } from "react";
import GateScanContent from "./GateScanContent";

export const dynamic = 'force-dynamic';

export default function GateScanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <GateScanContent />
    </Suspense>
  );
}