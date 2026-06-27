// lib/captureImage.ts
import html2canvas from "html2canvas";

/**
 * Capture un élément DOM en le clonant hors écran,
 * en remplaçant toutes les couleurs "lab" par du RGB,
 * et en forçant les couleurs calculées en inline pour les propriétés clés.
 */
export async function captureElement(
  element: HTMLElement,
  options?: any
): Promise<HTMLCanvasElement> {
  // 1. Créer un conteneur hors écran
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = element.offsetWidth + "px";
  container.style.height = element.offsetHeight + "px";
  container.style.background = "white";
  document.body.appendChild(container);

  // 2. Cloner l'élément
  const clone = element.cloneNode(true) as HTMLElement;
  container.appendChild(clone);

  // 3. Forcer les couleurs calculées en inline pour éviter les variables CSS
  const allElements = clone.querySelectorAll("*");
  allElements.forEach((el) => {
    const style = (el as HTMLElement).style;
    const win = (el as HTMLElement).ownerDocument?.defaultView;
    if (win) {
      const computed = win.getComputedStyle(el);
      // Couleurs clés à forcer
      const props = ["color", "backgroundColor", "borderColor", "backgroundImage"];
      props.forEach((prop) => {
        const val = computed.getPropertyValue(prop);
        if (val && !val.includes("lab") && !val.includes("var(")) {
          // On ne force que si la valeur n'est pas déjà une variable ou lab
          // Pour éviter d'écraser les dégradés, on saute backgroundImage si ce n'est pas un dégradé
          if (prop === "backgroundImage" && val !== "none" && !val.includes("gradient")) {
            return;
          }
          style.setProperty(prop, val);
        }
      });
    }
  });

  // 4. Maintenant, remplacer toutes les occurrences restantes de "lab" dans les styles inline
  allElements.forEach((el) => {
    const style = (el as HTMLElement).style;
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
    // Vérifier aussi via getComputedStyle si des lab subsistent
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

  // 5. S'assurer que le clone a les bonnes dimensions
  clone.style.width = element.offsetWidth + "px";
  clone.style.height = element.offsetHeight + "px";

  // 6. Capturer
  const canvas = await html2canvas(clone, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
    ...options,
  });

  // 7. Nettoyer
  document.body.removeChild(container);

  return canvas;
}