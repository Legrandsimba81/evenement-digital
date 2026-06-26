// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

// @ts-ignore - Ignorer l'erreur de typage pour le build
const globalForPrisma = global as unknown as { prisma: any }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma