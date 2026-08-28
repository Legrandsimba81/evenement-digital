// lib/fairePartService.ts

export interface ShareFairePartPayload {
  eventId: string;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  shareMethod: "whatsapp" | "email" | "link";
  customMessage?: string;
  fairePartUrl?: string; // optionnel, si vous avez déjà un lien personnalisé
}

export interface ShareResponse {
  success: boolean;
  message: string;
  shareUrl?: string;
}

/**
 * Service de partage – ne persiste rien, agit directement côté client
 */
export async function sendFairePartShare(
  payload: ShareFairePartPayload
): Promise<ShareResponse> {
  try {
    // Construction de l'URL de partage (si non fournie, on la construit)
    const shareUrl =
      payload.fairePartUrl ||
      `${window.location.origin}/invitation/${payload.eventId}`;

    const defaultText =
      payload.customMessage ||
      `Bonjour, vous êtes invité(e) à notre événement ! Consultez votre invitation ici : ${shareUrl}`;

    // Action selon la méthode choisie
    if (payload.shareMethod === "whatsapp" && payload.guestPhone) {
      const formattedPhone = payload.guestPhone.replace(/[^0-9]/g, "");
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(defaultText)}`;
      window.open(whatsappUrl, "_blank");
    } else if (payload.shareMethod === "email" && payload.guestEmail) {
      const mailtoUrl = `mailto:${payload.guestEmail}?subject=${encodeURIComponent("Votre invitation Octavia Event")}&body=${encodeURIComponent(defaultText)}`;
      window.location.href = mailtoUrl;
    } else if (payload.shareMethod === "link") {
      await navigator.clipboard.writeText(shareUrl);
    }

    return {
      success: true,
      message: "Invitation envoyée avec succès !",
      shareUrl,
    };
  } catch (error: any) {
    console.error("Erreur sendFairePartShare:", error);
    return {
      success: false,
      message: error.message || "Une erreur est survenue lors du partage.",
    };
  }
}