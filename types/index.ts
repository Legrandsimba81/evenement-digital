// types/index.ts
export type Role = "USER" | "ADMIN"
export type EventType = "ANNIVERSAIRE" | "MARIAGE" | "SOUTENANCE" | "AUTRE"

// Pour les composants, on utilise any pour éviter les imports de Prisma
export type EventWithRelations = any
export type UserWithEvents = any
export type User = any
export type Guest = any
export type Message = any