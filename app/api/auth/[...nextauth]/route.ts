import { handlers } from "@/auth"

export const { GET, POST } = handlers

// ✅ Forcer le mode dynamique pour éviter les erreurs de build
export const dynamic = 'force-dynamic'
// ✅ Optionnel : spécifier le runtime Node.js (pas edge)
export const runtime = 'nodejs'