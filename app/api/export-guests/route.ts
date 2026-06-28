import { exportGuestList } from "@/actions/guest-actions";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  const format = searchParams.get("format") || "csv";

  if (!eventId) {
    return NextResponse.json({ error: "eventId requis" }, { status: 400 });
  }

  try {
    const result = await exportGuestList(eventId, format as any);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    if (format === "csv") {
      const headers = new Headers();
      headers.set("Content-Type", "text/csv");
      headers.set("Content-Disposition", `attachment; filename=invites-${eventId}.csv`);
      return new NextResponse(result.csvContent, { headers });
    } else if (format === "pdf") {
      const pdfBuffer = Buffer.from(result.pdfBase64!, 'base64');
      const headers = new Headers();
      headers.set("Content-Type", "application/pdf");
      headers.set("Content-Disposition", `attachment; filename=invites-${eventId}.pdf`);
      return new NextResponse(pdfBuffer, { headers });
    }

    return NextResponse.json({ error: "Format non supporté" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}