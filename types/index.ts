// types/index.ts
import type { Event, Guest, User, Message } from '@prisma/client'

export type Role = "USER" | "ADMIN"
export type EventType = "ANNIVERSAIRE" | "MARIAGE" | "SOUTENANCE" | "AUTRE"

export type EventWithRelations = Event & {
  user: User
  guests: Guest[]
  messages: Message[]
}

export type EventWithGuests = Event & {
  guests: Guest[]
}

export type UserWithEvents = User & {
  events: Event[]
}