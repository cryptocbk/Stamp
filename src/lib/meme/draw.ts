import type { Caption, CaptionId, CaptionLayout, MemeStyle } from "./types";

const MEME_FONT = 'Anton, Impact, "Arial Black", sans-serif';

export async function ensureMemeFont() {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await Promise.race([
      document.fonts.load(`80px Anton`),
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, 1200);
      }),
    ]);
  } catch {
    /* fall back to Impact / Arial Black */
  }
}

function applyFont(ctx: CanvasRenderingContext2D, fontSize: number) {
  ctx.font = `400 ${fontSize}px ${MEME_FONT}`;
  if ("letterSpacing" in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
      `${Math.round(fontSize * 0.02)}px`;
  }
}

function breakWord(
  ctx: CanvasRenderingContext2D,
  word: string,
  maxWidth: number,
): string[] {
  if (ctx.measureText(word).width <= maxWidth) return [word];
  const chars = [...word];
  const lines: string[] = [];
  let current = "";
  for (const ch of chars) {
    const next = current + ch;
    if (current && ctx.measureText(next).width > maxWidth) {
      lines.push(current);
      current = ch;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const paragraphs = text.replace(/\r/g, "").split("\n");
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }
    let current = "";
    for (const word of words) {
      const pieces = breakWord(ctx, word, maxWidth);
      for (const piece of pieces) {
        const next = current ? `${current} ${piece}` : piece;
        if (current && ctx.measureText(next).width > maxWidth) {
          lines.push(current);
          current = piece;
        } else {
          current = next;
        }
      }
    }
    if (current) lines.push(current);
  }
  return lines.length ? lines : [""];
}

export function prepareCaption(text: string, allCaps: boolean) {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return allCaps ? trimmed.toUpperCase() : trimmed;
}

function fitCaption(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
  desired: number,
) {
  let fontSize = desired;
  let lines: string[] = [text];
  while (fontSize >= 18) {
    applyFont(ctx, fontSize);
    lines = wrapText(ctx, text, maxWidth);
    const blockHeight = lines.length * fontSize * 1.08;
    const widest = Math.max(0, ...lines.map((line) => ctx.measureText(line).width));
    if (blockHeight <= maxHeight && widest <= maxWidth) break;
    fontSize -= 2;
  }
  applyFont(ctx, fontSize);
  lines = wrapText(ctx, text, maxWidth);
  return { fontSize, lines, lineHeight: fontSize * 1.08 };
}

export function drawMeme(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  captions: Caption[],
  style: MemeStyle,
): CaptionLayout[] {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.fillStyle = style.fillColor;
  ctx.strokeStyle = style.strokeColor;

  const maxWidth = width * 0.9;
  const maxHeight = height * 0.34;
  const desired = Math.max(18, style.fontSize * width);
  const layouts: CaptionLayout[] = [];

  for (const caption of captions) {
    const text = prepareCaption(caption.text, style.allCaps);
    if (!text) {
      layouts.push({
        id: caption.id,
        x: caption.x,
        y: caption.y,
        width: 0.6,
        height: desired / height,
      });
      continue;
    }

    const fitted = fitCaption(ctx, text, maxWidth, maxHeight, desired);
    ctx.lineWidth = Math.max(1, style.strokeWidth * fitted.fontSize);
    applyFont(ctx, fitted.fontSize);

    const blockHeight = fitted.lines.length * fitted.lineHeight;
    const cx = caption.x * width;
    const cy = caption.y * height;
    const startY = cy - (blockHeight - fitted.lineHeight) / 2;

    for (let i = 0; i < fitted.lines.length; i++) {
      const y = startY + i * fitted.lineHeight;
      if (style.strokeWidth > 0.01) ctx.strokeText(fitted.lines[i], cx, y);
      ctx.fillText(fitted.lines[i], cx, y);
    }

    const measured = Math.max(
      ...fitted.lines.map((line) => ctx.measureText(line).width),
      fitted.fontSize,
    );

    layouts.push({
      id: caption.id,
      x: caption.x,
      y: caption.y,
      width: Math.min(0.96, (measured + fitted.fontSize * 0.4) / width),
      height: Math.min(0.6, (blockHeight + fitted.fontSize * 0.35) / height),
    });
  }

  return layouts;
}

export function exportMemePng(
  image: HTMLImageElement,
  captions: Caption[],
  style: MemeStyle,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("Canvas недоступен"));
  drawMeme(ctx, image, captions, style);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Не удалось сохранить изображение"));
    }, "image/png");
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function fileNameFromCaptions(captions: Caption[], allCaps: boolean) {
  const parts = captions
    .map((c) => prepareCaption(c.text, allCaps))
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .slice(0, 48);
  return parts ? `stamp-${parts}.png` : "stamp-meme.png";
}

export function captionById(captions: Caption[], id: CaptionId) {
  return captions.find((c) => c.id === id);
}
