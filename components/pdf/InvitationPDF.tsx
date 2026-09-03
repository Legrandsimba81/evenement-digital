import { Document, Page, Text, View, Image, Link, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#FAFAFA",
    fontFamily: "Helvetica",
  },
  card: {
    borderWidth: 2,
    borderColor: "#D4AF37",
    borderRadius: 12,
    padding: 24,
    backgroundColor: "#FFFFFF",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  header: {
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 10,
    marginBottom: 12,
  },
  badge: {
    fontSize: 9,
    color: "#D4AF37",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
    fontWeight: "bold",
    textAlign: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  guestSection: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    alignItems: "center",
  },
  guestLabel: {
    fontSize: 9,
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  guestName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
    gap: 15,
  },
  detailsSection: {
    flex: 1,
    gap: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 11,
    color: "#4B5563",
    fontWeight: "bold",
    width: 60,
  },
  detailValue: {
    fontSize: 11,
    color: "#111827",
    flex: 1,
  },
  qrContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
  },
  qrImage: {
    width: 90,
    height: 90,
  },
  qrCaption: {
    fontSize: 8,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
    alignItems: "center",
  },
  footerLink: {
    fontSize: 9,
    color: "#2563EB",
    textDecoration: "underline",
    textAlign: "center",
  },
});

interface InvitationPDFProps {
  event: {
    title: string;
    date: Date | string;
    location: string;
  };
  guestName?: string;
  qrCodeUrl?: string;
  scanLink?: string;
}

export default function InvitationPDF({
  event,
  guestName,
  qrCodeUrl,
  scanLink,
}: InvitationPDFProps) {
  const formattedDate = event?.date
    ? new Date(event.date).toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Date non renseignée";

  return (
    <Document>
      <Page size="A5" orientation="landscape" style={styles.page}>
        <View style={styles.card}>
          {/* Entête */}
          <View style={styles.header}>
            <Text style={styles.badge}>INVITATION OFFICIELLE</Text>
            <Text style={styles.title}>{event.title}</Text>
          </View>

          {/* Section Nom de l'invité */}
          {guestName && guestName.trim() !== "" && (
            <View style={styles.guestSection}>
              <Text style={styles.guestLabel}>Invitation délivrée à</Text>
              <Text style={styles.guestName}>{guestName.trim()}</Text>
            </View>
          )}

          {/* Contenu principal (Détails + QR) */}
          <View style={styles.contentContainer}>
            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>📅 Date :</Text>
                <Text style={styles.detailValue}>{formattedDate}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>📍 Lieu :</Text>
                <Text style={styles.detailValue}>{event.location}</Text>
              </View>
            </View>

            {/* Affichage du QR Code */}
            {qrCodeUrl && (
              <View style={styles.qrContainer}>
                <Image src={qrCodeUrl} style={styles.qrImage} />
                <Text style={styles.qrCaption}>Scan accès</Text>
              </View>
            )}
          </View>

          {/* Pied de page avec lien direct */}
          <View style={styles.footer}>
            {scanLink && (
              <Link src={scanLink} style={styles.footerLink}>
                Accéder au scan dans le dashboard
              </Link>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}