// types/index.ts
import type { Event, Guest, User, Message } from '@prisma/client'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'
import type { LucideProps } from 'lucide-react'

export type Role = "USER" | "ADMIN"
export type EventType = "ANNIVERSAIRE" | "MARIAGE" | "SOUTENANCE" | "AUTRE"

export type PlanIcon = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>

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

export interface Plan {
  id: string;
  category: string;
  name: string;
  price: number;
  currency: string;
  icon: PlanIcon;
  color: string;
  description: string;
  features: string[];
  eventType?: string;
}