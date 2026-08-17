// actions/guest-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { canManageEvent } from "@/lib/permissions";
import { createNotification, notifyLimitReached,  } from "@/lib/notifications";
import {sendGuestInvitation} from "@/lib/notification-external";

async function generateInvitationNumber(eventId: string): Promise<string> {
  const count = await prisma.guest.count({ where: { eventId } });
  const num = String(count + 1).padStart(3, '0');
  return `INV-${num}`;
}

export async function addGuest(
  eventId: string,
  firstName: string,
  lastName: string,
  title?: string,
  invitationType: string = "seul",
  guestLevel?: string,
  phone?: string,   // nouveau
  email?: string    // nouveau
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { user: true },
  });
  if (!event) throw new Error("Événement non trouvé");

  const hasAccess = await canManageEvent(eventId, session.user.id);
  if (!hasAccess) throw new Error("Non autorisé");

  // Vérification des limites
  const owner = event.user;
  const limits = owner.eventLimits as Record<string, number | null> | null;
  const limit = limits?.[event.type] ?? 5;
  const existingGuestsCount = await prisma.guest.count({
    where: {
      event: {
        userId: owner.id,
        type: event.type,
      },
    },
  });
  if (limit !== null && existingGuestsCount >= limit) {
    await notifyLimitReached(owner.id, event.type, limit);
    throw new Error(
      `Limite atteinte : vous ne pouvez pas ajouter plus de ${limit} invités pour les événements de type "${event.type}".`
    );
  }

  const invitationNumber = await generateInvitationNumber(eventId);

  const guest = await prisma.guest.create({
    data: {
      firstName,
      lastName,
      title: title || null,
      invitationType,
      invitationNumber,
      status: "en_attente",
      eventId,
      guestLevel: guestLevel || null,
      phone: phone || null,
      email: email || null,
    },
  });

  // Notification à l'organisateur
  await createNotification({
    userId: owner.id,
    type: "info",
    title: "Nouvel invité ajouté",
    message: `${firstName} ${lastName} a été ajouté à l'événement "${event.title}".`,
    link: `/dashboard/${event.slug}/guests`,
  });

  // Envoyer l'invitation si phone ou email est renseigné
  if (phone || email) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://evenement-digital.vercel.app";
    const invitationLink = `${baseUrl}/invitation/${event.slug}?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`;
    await sendGuestInvitation({
      phone: phone || undefined,
      email: email || undefined,
      guestName: `${firstName} ${lastName}`,
      eventTitle: event.title,
      invitationLink,
    });
  }

  revalidatePath(`/dashboard/${event.slug}`);
}

export async function removeGuest(guestId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: { event: true },
  });
  if (!guest) throw new Error("Invité non trouvé");

  const hasAccess = await canManageEvent(guest.eventId, session.user.id);
  if (!hasAccess) throw new Error("Non autorisé");

  const guestName = guest.title ? `${guest.title} ${guest.firstName} ${guest.lastName}` : `${guest.firstName} ${guest.lastName}`;

  await prisma.guest.delete({ where: { id: guestId } });

  await createNotification({
    userId: guest.event.userId,
    type: "warning",
    title: "Invité supprimé",
    message: `${guestName} a été retiré de l'événement "${guest.event.title}".`,
    link: `/dashboard/${guest.event.slug}/guests`,
  });

  revalidatePath(`/dashboard/${guest.event.slug}`);
}

export async function updateGuest(
  guestId: string,
  data: {
    title?: string;
    firstName?: string;
    lastName?: string;
    invitationType?: string;
    status?: string;
    guestLevel?: string;
    phone?: string;
    email?: string;
  }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: { event: true },
  });
  if (!guest) throw new Error("Invité non trouvé");

  const hasAccess = await canManageEvent(guest.eventId, session.user.id);
  if (!hasAccess) throw new Error("Non autorisé");

  const phoneChanged = data.phone !== undefined && data.phone !== guest.phone;
  const emailChanged = data.email !== undefined && data.email !== guest.email;

  const updated = await prisma.guest.update({
    where: { id: guestId },
    data: {
      title: data.title || null,
      firstName: data.firstName,
      lastName: data.lastName,
      invitationType: data.invitationType || guest.invitationType,
      status: data.status || guest.status,
      guestLevel: data.guestLevel || null,
      phone: data.phone || null,
      email: data.email || null,
    },
  });

  const guestName = data.firstName && data.lastName 
    ? `${data.firstName} ${data.lastName}` 
    : `${guest.firstName} ${guest.lastName}`;

  await createNotification({
    userId: guest.event.userId,
    type: "info",
    title: "Informations d'invité modifiées",
    message: `Les informations de ${guestName} ont été mises à jour pour l'événement "${guest.event.title}".`,
    link: `/dashboard/${guest.event.slug}/guests`,
  });

  if ((phoneChanged || emailChanged) && (data.phone || data.email)) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://evenement-digital.vercel.app";
    const invitationLink = `${baseUrl}/invitation/${guest.event.slug}?firstName=${encodeURIComponent(updated.firstName)}&lastName=${encodeURIComponent(updated.lastName)}`;
    await sendGuestInvitation({
      phone: data.phone || undefined,
      email: data.email || undefined,
      guestName: `${updated.firstName} ${updated.lastName}`,
      eventTitle: guest.event.title,
      invitationLink,
    });
  }

  revalidatePath(`/dashboard/${guest.event.slug}`);
}

export async function updateGuestStatus(guestId: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: { event: true },
  });
  if (!guest) throw new Error("Invité non trouvé");

  const hasAccess = await canManageEvent(guest.eventId, session.user.id);
  if (!hasAccess) throw new Error("Non autorisé");

  const statusLabels: Record<string, string> = {
    en_attente: "En attente",
    attending: "Présent",
    annule: "Annulé",
    entre: "Entré",
  };
  const statusLabel = statusLabels[status] || status;

  await prisma.guest.update({
    where: { id: guestId },
    data: { status },
  });

  const guestName = guest.title ? `${guest.title} ${guest.firstName} ${guest.lastName}` : `${guest.firstName} ${guest.lastName}`;
  await createNotification({
    userId: guest.event.userId,
    type: "info",
    title: "Statut d'invité mis à jour",
    message: `${guestName} est maintenant "${statusLabel}" pour l'événement "${guest.event.title}".`,
    link: `/dashboard/${guest.event.slug}/guests`,
  });

  revalidatePath(`/dashboard/${guest.event.slug}`);
}

export async function getGuests(eventId: string, search?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  const hasAccess = await canManageEvent(eventId, session.user.id);
  if (!hasAccess) throw new Error("Non autorisé");

  return prisma.guest.findMany({
    where: {
      eventId,
      OR: search ? [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { invitationNumber: { contains: search } },
      ] : undefined,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function exportGuestList(eventId: string, format: "csv" | "pdf" = "csv") {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  const hasAccess = await canManageEvent(eventId, session.user.id);
  if (!hasAccess) throw new Error("Non autorisé");

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { guests: { orderBy: { createdAt: "asc" } } },
  });
  if (!event) throw new Error("Événement non trouvé");

  const guests = event.guests;

  if (format === "csv") {
    const headers = ["N°", "Titre", "Prénom", "Nom", "Type", "Statut", "Numéro d'invitation", "Niveau", "Téléphone", "Email"];
    const rows = guests.map((g: any, index: number) => [
      index + 1,
      g.title || "",
      g.firstName,
      g.lastName,
      g.invitationType === "couple" ? "Couple" : "Seul",
      g.status || "En attente",
      g.invitationNumber || "",
      g.guestLevel || "",
      g.phone || "",
      g.email || "",
    ]);
    const csvContent = [headers.join(","), ...rows.map((row: string[]) => row.join(","))].join("\n");
    return { success: true, csvContent };
  }

  if (format === "pdf") {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 10;
    const lineHeight = 15;

    let y = height - 50;
    const margin = 50;

    page.drawText(`Liste des invités - ${event.title}`, {
      x: margin,
      y: y,
      size: 16,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 30;

    const headers = ["N°", "Titre", "Prénom", "Nom", "Type", "Statut", "N° Invitation", "Niveau", "Téléphone", "Email"];
    const headerX = [50, 90, 140, 200, 260, 310, 370, 430, 470, 510];
    headers.forEach((h: string, i: number) => {
      page.drawText(h, {
        x: headerX[i],
        y: y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    });
    y -= lineHeight;

    guests.forEach((g: any, index: number) => {
      const row = [
        String(index + 1),
        g.title || "",
        g.firstName,
        g.lastName,
        g.invitationType === "couple" ? "Couple" : "Seul",
        g.status || "En attente",
        g.invitationNumber || "",
        g.guestLevel || "",
        g.phone || "",
        g.email || "",
      ];
      row.forEach((text: string, i: number) => {
        page.drawText(text, {
          x: headerX[i],
          y: y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      });
      y -= lineHeight;
      if (y < 50) {
        const newPage = pdfDoc.addPage([600, 800]);
        y = height - 50;
      }
    });

    const pdfBytes = await pdfDoc.save();
    const base64 = Buffer.from(pdfBytes).toString('base64');
    return { success: true, pdfBase64: base64 };
  }

  return { success: false, message: "Format non supporté" };
}