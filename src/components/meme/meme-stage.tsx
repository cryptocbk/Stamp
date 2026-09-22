import { useCallback, useEffect, useRef, useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { drawMeme, ensureMemeFont } from "@/lib/meme/draw";
import { loadHtmlImage } from "@/lib/meme/image";
import type { CaptionId, CaptionLayout } from "@/lib/meme/types";
import { useMemeStore } from "@/store/meme-store";

type DragState = {
  id: CaptionId;
  dx: number;
  dy: number;
};

export function MemeStage({
  onFiles,
}: {
  onFiles: (files: FileList | File[]) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const { image, captions, style, selectedId, selectCaption, setCaptionPos } =
    useMemeStore();

  const [layouts, setLayouts] = useState<CaptionLayout[]>([]);
  const [dropActive, setDropActive] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const dragRef = useRef<DragState | null>(null);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setLayouts(drawMeme(ctx, img, captions, style));
  }, [captions, style]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const img = await loadHtmlImage(image.src);
        if (cancelled) return;
        imageRef.current = img;
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
        }
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [image.src]);

  useEffect(() => {
    if (status === "ready") paint();
  }, [paint, status]);

  useEffect(() => {
    let cancelled = false;
    void ensureMemeFont().then(() => {
      if (!cancelled) paint();
    });
    return () => {
      cancelled = true;
    };
  }, [paint]);

  const moveToPointer = useCallback(
    (event: React.PointerEvent | PointerEvent, drag: DragState) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = (event.clientX - rect.left) / rect.width - drag.dx;
      const y = (event.clientY - rect.top) / rect.height - drag.dy;
      setCaptionPos(drag.id, x, y);
    },
    [setCaptionPos],
  );

  function startDrag(
    event: React.PointerEvent<HTMLButtonElement>,
    id: CaptionId,
    layout: CaptionLayout,
  ) {
    event.preventDefault();
    event.stopPropagation();
    selectCaption(id);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    dragRef.current = { id, dx: x - layout.x, dy: y - layout.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onHandleMove(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    moveToPointer(event, drag);
  }

  function endDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  }

  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    setDropActive(false);
    if (event.dataTransfer.files.length) onFiles(event.dataTransfer.files);
  }

  return (
    <div
      className={cn(
        "relative flex min-h-64 flex-1 items-center justify-center overflow-hidden rounded-xl bg-well p-3 sm:p-5",
        dropActive && "ring-2 ring-accent/70",
      )}
      onDragEnter={(e) => {
        e.preventDefault();
        if (hasFiles(e)) setDropActive(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (hasFiles(e)) setDropActive(true);
      }}
      onDragLeave={() => setDropActive(false)}
      onDrop={onDrop}
    >
      <div className="relative inline-block max-w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="stage-canvas rounded-md bg-elevated shadow-stage"
          aria-label="Холст мема"
        />

        {status === "ready" &&
          layouts.map((layout) => {
            const caption = captions.find((c) => c.id === layout.id);
            if (!caption) return null;
            if (layout.y < -0.02 || layout.y > 1.02) return null;
            const selected = selectedId === layout.id;
            const w = Math.max(layout.width, 0.55);
            const h = Math.max(layout.height, 0.1);
            return (
              <button
                key={layout.id}
                type="button"
                aria-label={
                  layout.id === "top"
                    ? "Переместить верхний текст"
                    : "Переместить нижний текст"
                }
                className={cn(
                  "absolute touch-none rounded-sm border border-transparent bg-transparent",
                  "cursor-grab active:cursor-grabbing",
                  selected
                    ? "border-accent/80 bg-accent/5"
                    : "hover:border-accent/30",
                )}
                style={{
                  left: `${layout.x * 100}%`,
                  top: `${layout.y * 100}%`,
                  width: `${w * 100}%`,
                  height: `${h * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onPointerDown={(e) => startDrag(e, layout.id, layout)}
                onPointerMove={onHandleMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onClick={() => selectCaption(layout.id)}
              />
            );
          })}
      </div>

      {status === "loading" && (
        <div
          className="absolute inset-3 rounded-lg bg-elevated/80"
          aria-hidden="true"
        />
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-muted">
          <ImageIcon className="size-6" />
          Не удалось открыть изображение
        </div>
      )}

      {dropActive && (
        <div className="pointer-events-none absolute inset-3 flex items-center justify-center rounded-lg border border-dashed border-accent/50 bg-bg/70 text-sm font-medium text-fg">
          Отпустите, чтобы загрузить
        </div>
      )}
    </div>
  );
}

function hasFiles(event: React.DragEvent) {
  return Array.from(event.dataTransfer.types).includes("Files");
}
