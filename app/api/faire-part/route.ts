import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      groomName,
      brideName,
      announcementText,
      eventDate,
      eventTime,
      locationName,
      mapsUrl,
      invitationLink,
      rsvpDeadline,
      mobileMoneyNumber,
      mobileMoneyName,
      contactPhone,
      contactEmail,
      importantNote,
      imageUrl,
    } = body;

    if (!title || !groomName || !brideName || !announcementText || !eventDate || !eventTime || !locationName) {
      return NextResponse.json(
        { error: "Veuillez remplir tous les champs obligatoires." },
        { status: 400 }
      );
    }

    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const fairePart = await prisma.fairePart.create({
      data: {
        title,
        slug,
        groomName,
        brideName,
        announcementText,
        eventDate: new Date(eventDate),
        eventTime,
        locationName,
        mapsUrl: mapsUrl || null,
        invitationLink: invitationLink || null,
        rsvpDeadline: rsvpDeadline ? new Date(rsvpDeadline) : null,
        mobileMoneyNumber: mobileMoneyNumber || null,
        mobileMoneyName: mobileMoneyName || null,
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        importantNote: importantNote || null,
        imageUrl: imageUrl || null,
        userId,
      },
    });

    return NextResponse.json(fairePart, { status: 201 });
  } catch (error: any) {
    console.error("Erreur création faire-part:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}