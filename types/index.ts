// types/index.ts
import { Prisma } from '@prisma/client'

// Utilisation des types génériques de Prisma pour récupérer les modèles
type Event = Prisma.EventGetPayload<{}>
type User = Prisma.UserGetPayload<{}>
type Guest = Prisma.GuestGetPayload<{}>
type Message = Prisma.MessageGetPayload<{}>

// Définition des types avec relations
export type EventWithRelations = Event & {
  user: User
  guests: Guest[]
  messages: Message[]
}

export type UserWithEvents = User & {
  events: Event[]
}

export type Role = "USER" | "ADMIN"
export type EventType = "ANNIVERSAIRE" | "MARIAGE" | "SOUTENANCE" | "AUTRE"