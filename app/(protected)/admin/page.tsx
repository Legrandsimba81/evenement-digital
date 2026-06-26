import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { EventWithRelations } from "@/types"

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  })

  const events = (await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      guests: true,
      messages: true,
    },
  })) as EventWithRelations[]

  // ✅ Correction : typage explicite du paramètre e
  const totalMessages = events.reduce((acc: number, e: EventWithRelations) => acc + e.messages.length, 0)

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard Administrateur</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Utilisateurs</h2>
          <p className="text-3xl">{users.length}</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Événements</h2>
          <p className="text-3xl">{events.length}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Messages</h2>
          <p className="text-3xl">{totalMessages}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Derniers utilisateurs</h2>
          <ul className="space-y-2">
            {users.slice(0, 10).map((user) => (
              <li key={user.id} className="border-b pb-2">
                <p><strong>{user.name || "Anonyme"}</strong> ({user.email})</p>
                <p className="text-sm text-gray-600">Rôle : {user.role}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Derniers événements</h2>
          <ul className="space-y-2">
            {events.slice(0, 10).map((event) => (
              <li key={event.id} className="border-b pb-2">
                <p><strong>{event.title}</strong> - {event.type}</p>
                <p className="text-sm text-gray-600">
                  Organisé par {event.user.name || event.user.email} - {event.guests.length} invités
                </p>
                <Link href={`/dashboard/${event.slug}`} className="text-blue-500 text-sm">
                  Voir
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}