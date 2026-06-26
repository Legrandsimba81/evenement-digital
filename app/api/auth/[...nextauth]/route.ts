import { handlers } from "@/auth"

export const { GET, POST } = handlers

// Important : forcer le mode dynamique pour éviter les erreurs de build
export const dynamic = 'force-dynamic'