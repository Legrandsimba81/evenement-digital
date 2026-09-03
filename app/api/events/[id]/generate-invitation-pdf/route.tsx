import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageEvent } from "@/lib/permissions";
import { renderToStream } from "@react-pdf/renderer";
import InvitationPDF from "@/components/pdf/InvitationPDF";
import QRCode from "qrcode";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: eventId } = await params;
    const body = await req.json().catch(() => ({}));
    const guestName = body?.guestName;
    const token = body?.token; // Récupération du token si transmis

    const hasAccess = await canManageEvent(eventId, session.user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, slug: true, title: true, date: true, location: true, isPaid: true },
    });

    if (!event || !event.isPaid) {
      return NextResponse.json(
        { error: "Fonctionnalité réservée aux événements payants" },
        { status: 403 }
      );
    }

    // URL de base de l'application
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://evenement-digital.vercel.app";

    // Lien de validation du QR hors liste (ou page du dashboard de scan)
    const scanLink = `${baseUrl}/dashboard/events/${event.id}/scan-unlisted${token ? `?token=${token}` : ""}`;

    // Génération de l'image QR Code en Data URI (Base64)
    const qrCodeDataUrl = await QRCode.toDataURL(scanLink, {
      margin: 1,
      width: 300,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Génération du PDF
    const pdfStream = await renderToStream(
      <InvitationPDF
        event={event}
        guestName={guestName}
        qrCodeUrl={qrCodeDataUrl}
        scanLink={scanLink}
      />
    );

    return new NextResponse(pdfStream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invitation-${encodeURIComponent(
          event.title
        )}.pdf"`,
      },
    });
  } catch (error) {
    console.error("❌ Erreur generate-invitation-pdf:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}