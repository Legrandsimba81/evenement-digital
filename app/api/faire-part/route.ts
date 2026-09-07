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
      eventType = "UNIVERSAL",
      groomName,
      brideName,
      organizerName,
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

    // 1. Validation des champs obligatoires communs
    if (!title || !announcementText || !eventDate || !eventTime || !locationName) {
      return NextResponse.json(
        { error: "Veuillez remplir tous les champs obligatoires (Titre, Message, Date, Heure, Lieu)." },
        { status: 400 }
      );
    }

    // 2. Validation dynamique selon le type d'événement
    if (eventType === "MARRIAGE" && (!groomName || !brideName)) {
      return NextResponse.json(
        { error: "Les noms du marié et de la mariée sont requis pour un mariage." },
        { status: 400 }
      );
    }

    if ((eventType === "BIRTHDAY" || eventType === "PARTY") && !organizerName) {
      return NextResponse.json(
        { error: "Le nom de la personne à l'honneur ou de l'hôte est requis." },
        { status: 400 }
      );
    }

    // 3. Génération du slug unique
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    // 4. Enregistrement en base de données
    const fairePart = await prisma.fairePart.create({
      data: {
        title,
        slug,
        eventType,
        // Sauvegarde uniquement les champs utiles selon la catégorie
        groomName: eventType === "MARRIAGE" ? groomName : null,
        brideName: eventType === "MARRIAGE" ? brideName : null,
        organizerName: ["BIRTHDAY", "PARTY"].includes(eventType) ? organizerName : null,
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