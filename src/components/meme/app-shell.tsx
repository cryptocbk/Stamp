import { useCallback, useEffect, useRef, useState } from "react";
import { Download, RotateCcw, Stamp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ControlPanel } from "@/components/meme/control-panel";
import { MemeStage } from "@/components/meme/meme-stage";
import { TemplateRail } from "@/components/meme/template-rail";
import {
  downloadBlob,
  ensureMemeFont,
  exportMemePng,
  fileNameFromCaptions,
} from "@/lib/meme/draw";
import { clipboardImage, fileToDataUrl, loadHtmlImage } from "@/lib/meme/image";
import { useMemeStore } from "@/store/meme-store";

export function AppShell() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const image = useMemeStore((s) => s.image);
  const captions = useMemeStore((s) => s.captions);
  const style = useMemeStore((s) => s.style);
  const reset = useMemeStore((s) => s.reset);
  const setUpload = useMemeStore((s) => s.setUpload);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const file = Array.from(files).find((f) => f.type.startsWith("image/"));
      if (!file) {
        toast.error("Нужен файл изображения");
        return;
      }
      try {
        const src = await fileToDataUrl(file);
        setUpload(src, file.name);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Ошибка загрузки");
      }
    },
    [setUpload],
  );

  async function handleDownload() {
    if (saving) return;
    setSaving(true);
    try {
      await ensureMemeFont();
      const img = await loadHtmlImage(image.src);
      const blob = await exportMemePng(img, captions, style);
      downloadBlob(blob, fileNameFromCaptions(captions, style.allCaps));
      toast.success("Мем сохранён");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось скачать");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    const onPaste = async (event: ClipboardEvent) => {
      const items = event.clipboardData?.files;
      if (items && items.length) {
        const imageFile = Array.from(items).find((f) =>
          f.type.startsWith("image/"),
        );
        if (imageFile) {
          event.preventDefault();
          await handleFiles([imageFile]);
          return;
        }
      }
      const fromClipboard = await clipboardImage();
      if (fromClipboard) setUpload(fromClipboard, "clipboard.png");
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFiles, setUpload]);

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-fg">
              <Stamp className="size-5" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="font-display text-xl leading-none text-fg sm:text-2xl">
                STAMP
              </p>
              <p className="mt-0.5 truncate text-xs text-muted">
                Генератор мемов
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="sm:w-auto sm:px-4"
                  onClick={reset}
                  aria-label="Сбросить текст и макет"
                >
                  <RotateCcw />
                  <span className="hidden sm:inline">Сбросить</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Сбросить текст и макет</TooltipContent>
            </Tooltip>

            <Button
              onClick={handleDownload}
              disabled={saving}
              className="sm:min-w-32"
            >
              <Download />
              {saving ? "Сохранение…" : "Скачать"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6">
        <div className="stagger-in flex flex-1 flex-col gap-4 lg:flex-row lg:items-stretch">
          <section className="flex min-w-0 flex-1 flex-col gap-4">
            <MemeStage onFiles={handleFiles} />
            <TemplateRail />
          </section>
          <ControlPanel onUploadClick={() => fileRef.current?.click()} />
        </div>
      </main>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          if (e.target.files) void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
