import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
    isSuperAdmin?: boolean // ✅
  }
  interface Session {
    user: {
      role?: string
      isSuperAdmin?: boolean // ✅
    } & DefaultSession["user"]
  }
}