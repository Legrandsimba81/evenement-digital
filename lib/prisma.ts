// lib/prisma.ts
// On utilise require pour éviter l'erreur de typage lors du build
const { PrismaClient } = require('@prisma/client')

const globalForPrisma = global as unknown as { prisma: any }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma