export type EventType = "ANNIVERSAIRE" | "MARIAGE" | "SOUTENANCE" | "AUTRE";
export type Role = "USER" | "ADMIN";
// types/index.ts
import { Event, User, Guest, Message } from "@prisma/client"

// Type pour un événement avec ses relations
export type EventWithRelations = Event & {
  user: User
  guests: Guest[]
  messages: Message[]
}

// Si vous voulez aussi un type pour l'utilisateur avec ses événements
export type UserWithEvents = User & {
  events: Event[]
}