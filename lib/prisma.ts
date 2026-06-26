// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

let prismaInstance: PrismaClient | null = null

function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    })
  }
  return prismaInstance
}

// Export d'un proxy qui délègue toutes les propriétés à getPrisma()
// Ainsi l'instance n'est créée que lors du premier accès à une propriété.
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return getPrisma()[prop as keyof PrismaClient]
  }
})