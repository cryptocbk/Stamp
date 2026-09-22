const MAX_EDGE = 1920;

export function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Не удалось загрузить изображение"));
    img.src = src;
  });
}

export async function fileToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Нужен файл изображения");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    const fallback = await readFileAsDataUrl(file);
    const img = await loadHtmlImage(fallback);
    return rasterize(img, file.type);
  }

  return rasterize(bitmap, file.type);
}

function rasterize(
  source: CanvasImageSource & { width: number; height: number },
  mime: string,
): string {
  const { width: sw, height: sh } = source;
  let width = sw;
  let height = sh;
  const edge = Math.max(width, height);
  if (edge > MAX_EDGE) {
    const scale = MAX_EDGE / edge;
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas недоступен");
  ctx.drawImage(source, 0, 0, width, height);

  const keepAlpha = mime === "image/png" || mime === "image/webp";
  return canvas.toDataURL(keepAlpha ? "image/png" : "image/jpeg", 0.92);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
    reader.readAsDataURL(file);
  });
}

export async function clipboardImage(): Promise<string | null> {
  if (!navigator.clipboard?.read) return null;
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      const type = item.types.find((t) => t.startsWith("image/"));
      if (!type) continue;
      const blob = await item.getType(type);
      const file = new File([blob], "clipboard.png", { type: blob.type });
      return fileToDataUrl(file);
    }
  } catch {
    return null;
  }
  return null;
}
