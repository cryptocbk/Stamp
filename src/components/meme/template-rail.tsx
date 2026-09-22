import { MEME_TEMPLATES } from "@/lib/meme/templates";
import { cn } from "@/lib/utils";
import { useMemeStore } from "@/store/meme-store";

export function TemplateRail() {
  const templateId = useMemeStore((s) => s.image.templateId);
  const setTemplate = useMemeStore((s) => s.setTemplate);

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-baseline justify-between gap-3 px-0.5">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted">
          Шаблоны
        </h2>
        <p className="text-xs text-subtle">или загрузите своё фото</p>
      </div>
      <div className="template-rail -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {MEME_TEMPLATES.map((template) => {
          const active = templateId === template.id;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => setTemplate(template.id)}
              className={cn(
                "group relative w-24 shrink-0 overflow-hidden rounded-md border text-left transition-[border-color,transform] duration-150 ease-out",
                "focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:outline-none",
                active ? "border-accent" : "border-border hover:border-muted",
              )}
            >
              <img
                src={template.src}
                alt=""
                className="thumb-frame"
                draggable={false}
              />
              <span
                className={cn(
                  "block truncate px-1.5 py-1 text-xs leading-tight",
                  active ? "text-fg" : "text-muted",
                )}
              >
                {template.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
