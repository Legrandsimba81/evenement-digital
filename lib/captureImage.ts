// lib/captureImage.ts
import html2canvas from "html2canvas";

/**
 * Capture un élément DOM en le clonant dans un conteneur hors écran,
 * en remplaçant toutes les occurrences de "lab" par des valeurs RGB,
 * puis en utilisant html2canvas sur le clone.
 */
export async function captureElement(
  element: HTMLElement,
  options?: any
): Promise<HTMLCanvasElement> {
  // Créer un conteneur hors écran
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = element.offsetWidth + "px";
  container.style.height = element.offsetHeight + "px";
  container.style.background = "white";
  document.body.appendChild(container);

  // Cloner l'élément
  const clone = element.cloneNode(true) as HTMLElement;
  container.appendChild(clone);

  // Remplacer toutes les couleurs "lab" dans le clone
  const allElements = clone.querySelectorAll("*");
  allElements.forEach((el) => {
    const style = (el as HTMLElement).style;
    // Parcourir toutes les propriétés inline
    for (let i = 0; i < style.length; i++) {
      const prop = style[i];
      const val = style[prop as any];
      if (val && typeof val === "string" && val.includes("lab")) {
        if (prop.includes("color") || prop.includes("border")) {
          style[prop as any] = "#000000";
        } else if (prop.includes("background")) {
          style[prop as any] = "#ffffff";
        } else {
          style[prop as any] = "none";
        }
      }
    }
    // Vérifier les styles calculés (via getComputedStyle)
    const win = (el as HTMLElement).ownerDocument?.defaultView;
    if (win) {
      const computed = win.getComputedStyle(el);
      for (let i = 0; i < computed.length; i++) {
        const prop = computed[i];
        const val = computed.getPropertyValue(prop);
        if (val && val.includes("lab")) {
          if (prop.includes("color") || prop.includes("border")) {
            (el as HTMLElement).style.setProperty(prop, "#000000");
          } else if (prop.includes("background")) {
            (el as HTMLElement).style.setProperty(prop, "#ffffff");
          } else {
            (el as HTMLElement).style.setProperty(prop, "none");
          }
        }
      }
    }
  });

  // Appliquer les styles du parent au clone (padding, marges, etc.)
  clone.style.width = element.offsetWidth + "px";
  clone.style.height = element.offsetHeight + "px";

  // Capturer avec html2canvas
  const canvas = await html2canvas(clone, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
    ...options,
  });

  // Nettoyer le DOM
  document.body.removeChild(container);

  return canvas;
}