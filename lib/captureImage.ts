import html2canvas from "html2canvas";

export async function captureElement(
  element: HTMLElement,
  options?: { backgroundColor?: string }
): Promise<HTMLCanvasElement> {
  // Couleur de fond par défaut : blanc
  const bgColor = options?.backgroundColor || "#ffffff";

  // 1. Créer un conteneur hors écran
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = element.offsetWidth + "px";
  container.style.height = element.offsetHeight + "px";
  container.style.background = bgColor;
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
      const props = ["color", "backgroundColor", "borderColor", "backgroundImage"];
      props.forEach((prop) => {
        const val = computed.getPropertyValue(prop);
        if (val && !val.includes("lab") && !val.includes("var(")) {
          if (prop === "backgroundImage" && val !== "none" && !val.includes("gradient")) {
            return;
          }
          style.setProperty(prop, val);
        }
      });
    }
  });

  // 4. Nettoyer les valeurs "lab"
  allElements.forEach((el) => {
    const style = (el as HTMLElement).style;
    for (let i = 0; i < style.length; i++) {
      const prop = style[i];
      const val = style[prop as any];
      if (val && typeof val === "string" && val.includes("lab")) {
        if (prop.includes("color") || prop.includes("border")) {
          style[prop as any] = "#000000";
        } else if (prop.includes("background")) {
          style[prop as any] = bgColor;
        } else {
          style[prop as any] = "none";
        }
      }
    }
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
            (el as HTMLElement).style.setProperty(prop, bgColor);
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

  // 6. Capturer avec html2canvas
  const canvas = await html2canvas(clone, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: bgColor,
    logging: false,
    ...options,
  });

  // 7. Nettoyer
  document.body.removeChild(container);

  return canvas;
}