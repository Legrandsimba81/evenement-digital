  "use server";

  import { prisma } from "@/lib/prisma";
  import { auth } from "@/auth";
  import { revalidatePath } from "next/cache";
  import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
  import { canManageEvent } from "@/lib/permissions";

  async function generateInvitationNumber(eventId: string): Promise<string> {
    const count = await prisma.guest.count({ where: { eventId } });
    const num = String(count + 1).padStart(3, '0');
    return `INV-${num}`;
  }

  export async function addGuest(eventId: string, firstName: string, lastName: string, title?: string, invitationType: string = "seul") {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non authentifié");

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error("Événement non trouvé");

    const hasAccess = await canManageEvent(eventId, session.user.id);
    if (!hasAccess) throw new Error("Non autorisé");

    const invitationNumber = await generateInvitationNumber(eventId);

    await prisma.guest.create({
      data: {
        firstName,
        lastName,
        title: title || null,
        invitationType,
        invitationNumber,
        status: "en_attente",
        eventId,
      },
    });
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

    await prisma.guest.delete({ where: { id: guestId } });
    revalidatePath(`/dashboard/${guest.event.slug}`);
  }

  export async function updateGuest(guestId: string, data: { title?: string; firstName?: string; lastName?: string; invitationType?: string; status?: string }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non authentifié");

    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: { event: true },
    });
    if (!guest) throw new Error("Invité non trouvé");

    const hasAccess = await canManageEvent(guest.eventId, session.user.id);
    if (!hasAccess) throw new Error("Non autorisé");

    await prisma.guest.update({
      where: { id: guestId },
      data: {
        title: data.title || null,
        firstName: data.firstName,
        lastName: data.lastName,
        invitationType: data.invitationType || guest.invitationType,
        status: data.status || guest.status,
      },
    });
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

    await prisma.guest.update({
      where: { id: guestId },
      data: { status },
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
      const headers = ["N°", "Titre", "Prénom", "Nom", "Type", "Statut", "Numéro d'invitation"];
      const rows = guests.map((g, index) => [
        index + 1,
        g.title || "",
        g.firstName,
        g.lastName,
        g.invitationType === "couple" ? "Couple" : "Seul",
        g.status || "En attente",
        g.invitationNumber || "",
      ]);

      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
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

      const headers = ["N°", "Titre", "Prénom", "Nom", "Type", "Statut", "N° Invitation"];
      const headerX = [50, 90, 140, 200, 260, 310, 370];
      headers.forEach((h, i) => {
        page.drawText(h, {
          x: headerX[i],
          y: y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      });
      y -= lineHeight;

      guests.forEach((g, index) => {
        const row = [
          String(index + 1),
          g.title || "",
          g.firstName,
          g.lastName,
          g.invitationType === "couple" ? "Couple" : "Seul",
          g.status || "En attente",
          g.invitationNumber || "",
        ];
        row.forEach((text, i) => {
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