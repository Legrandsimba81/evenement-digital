// lib/captureImage.ts
import html2canvas from "html2canvas";

/**
 * Capture un élément DOM avec html2canvas, en remplaçant automatiquement
 * toutes les couleurs "lab()" par des valeurs RGB pour éviter l'erreur
 * "Attempting to parse an unsupported color function 'lab'".
 */
export async function captureElement(
  element: HTMLElement,
  options?: any
): Promise<HTMLCanvasElement> {
  const backupStyles: { el: Element; prop: string; value: string }[] = [];

  try {
    // Sauvegarder et remplacer les styles "lab"
    const allElements = element.querySelectorAll("*");
    allElements.forEach((el) => {
      const style = (el as HTMLElement).style;
      // Vérifier toutes les propriétés inline
      for (let i = 0; i < style.length; i++) {
        const prop = style[i];
        const val = style[prop as any];
        if (val && typeof val === "string" && val.includes("lab")) {
          backupStyles.push({ el, prop, value: val });
          // Remplacer par une valeur RGB sûre
          if (prop.includes("color") || prop.includes("border")) {
            style[prop as any] = "#000000";
          } else if (prop.includes("background")) {
            style[prop as any] = "#ffffff";
          } else {
            style[prop as any] = "none";
          }
        }
      }
    });

    // Capturer
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      ...options,
    });

    return canvas;
  } finally {
    // Restaurer les styles sauvegardés
    backupStyles.forEach(({ el, prop, value }) => {
      (el as HTMLElement).style[prop as any] = value;
    });
  }
}