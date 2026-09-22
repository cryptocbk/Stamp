import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { LAYOUT_PRESETS } from "@/lib/meme/presets";
import { cn } from "@/lib/utils";
import { useMemeStore } from "@/store/meme-store";

const FILL_SWATCHES = ["#ffffff", "#f3eee6", "#0d0c0a"];
const STROKE_SWATCHES = ["#000000", "#ffffff", "#1f1c18"];

export function ControlPanel({ onUploadClick }: { onUploadClick: () => void }) {
  const captions = useMemeStore((s) => s.captions);
  const style = useMemeStore((s) => s.style);
  const selectedId = useMemeStore((s) => s.selectedId);
  const presetId = useMemeStore((s) => s.presetId);
  const setCaptionText = useMemeStore((s) => s.setCaptionText);
  const setStyle = useMemeStore((s) => s.setStyle);
  const selectCaption = useMemeStore((s) => s.selectCaption);
  const applyPreset = useMemeStore((s) => s.applyPreset);

  const top = captions.find((c) => c.id === "top");
  const bottom = captions.find((c) => c.id === "bottom");
  if (!top || !bottom) return null;

  return (
    <aside className="flex w-full flex-col gap-5 rounded-xl border border-border bg-surface p-4 sm:p-5 lg:w-80 lg:shrink-0">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-fg">Подписи</h2>
        <Button variant="secondary" size="sm" onClick={onUploadClick}>
          <Upload />
          Загрузить
        </Button>
      </div>

      <Field
        id="top-text"
        label="Верхний текст"
        value={top.text}
        active={selectedId === "top"}
        onFocus={() => selectCaption("top")}
        onChange={(value) => setCaptionText("top", value)}
      />
      <Field
        id="bottom-text"
        label="Нижний текст"
        value={bottom.text}
        active={selectedId === "bottom"}
        onFocus={() => selectCaption("bottom")}
        onChange={(value) => setCaptionText("bottom", value)}
      />

      <p className="text-xs text-subtle">
        Перетащите текст прямо на изображении.
      </p>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor="font-size">Размер шрифта</Label>
          <span className="tabular-nums text-xs text-muted">
            {Math.round(style.fontSize * 100)}
          </span>
        </div>
        <Slider
          id="font-size"
          min={0.04}
          max={0.16}
          step={0.002}
          value={[style.fontSize]}
          onValueChange={(value) => {
            if (value[0] != null) setStyle({ fontSize: value[0] });
          }}
          aria-label="Размер шрифта"
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor="stroke">Контур</Label>
          <span className="tabular-nums text-xs text-muted">
            {Math.round(style.strokeWidth * 100)}
          </span>
        </div>
        <Slider
          id="stroke"
          min={0}
          max={0.28}
          step={0.01}
          value={[style.strokeWidth]}
          onValueChange={(value) => {
            if (value[0] != null) setStyle({ strokeWidth: value[0] });
          }}
          aria-label="Толщина контура"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={style.allCaps ? "default" : "secondary"}
          onClick={() => setStyle({ allCaps: !style.allCaps })}
          aria-pressed={style.allCaps}
        >
          АА
        </Button>
        <span className="text-xs text-muted">Заглавные</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SwatchRow
          label="Цвет"
          value={style.fillColor}
          swatches={FILL_SWATCHES}
          onChange={(fillColor) => setStyle({ fillColor })}
        />
        <SwatchRow
          label="Обводка"
          value={style.strokeColor}
          swatches={STROKE_SWATCHES}
          onChange={(strokeColor) => setStyle({ strokeColor })}
        />
      </div>

      <div>
        <Label className="mb-2 block">Макет</Label>
        <div className="flex flex-wrap gap-1.5">
          {LAYOUT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className={cn(
                "h-10 rounded-sm border px-2.5 text-xs font-medium transition-[background-color,border-color,color] duration-150 ease-out",
                presetId === preset.id
                  ? "border-accent bg-accent text-accent-fg"
                  : "border-border bg-elevated text-muted hover:text-fg",
              )}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function Field({
  id,
  label,
  value,
  active,
  onChange,
  onFocus,
}: {
  id: string;
  label: string;
  value: string;
  active: boolean;
  onChange: (value: string) => void;
  onFocus: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        rows={2}
        onFocus={onFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        className={cn(active && "border-accent/50 ring-2 ring-ring/30")}
      />
    </div>
  );
}

function SwatchRow({
  label,
  value,
  swatches,
  onChange,
}: {
  label: string;
  value: string;
  swatches: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-1.5">
        {swatches.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`${label} ${color}`}
            onClick={() => onChange(color)}
            className={cn(
              "size-9 rounded-sm border transition-[transform,box-shadow] duration-150 ease-out",
              value.toLowerCase() === color
                ? "border-accent ring-2 ring-ring/50"
                : "border-border hover:border-muted",
            )}
            style={{ backgroundColor: color }}
          />
        ))}
        <label className="relative size-9 overflow-hidden rounded-sm border border-border">
          <span className="sr-only">{label}, свой цвет</span>
          <input
            type="color"
            value={toHex(value)}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -inset-2 size-14 cursor-pointer appearance-none border-0 bg-transparent p-0"
          />
        </label>
      </div>
    </div>
  );
}

function toHex(value: string) {
  if (/^#([0-9a-f]{6})$/i.test(value)) return value;
  return "#ffffff";
}
