import type { Caption, LayoutPresetId, MemeStyle } from "./types";

export const DEFAULT_STYLE: MemeStyle = {
  fontSize: 0.088,
  strokeWidth: 0.14,
  allCaps: true,
  fillColor: "#ffffff",
  strokeColor: "#000000",
};

export const DEFAULT_CAPTIONS: Caption[] = [
  { id: "top", text: "ВЕРХНИЙ ТЕКСТ", x: 0.5, y: 0.1 },
  { id: "bottom", text: "НИЖНИЙ ТЕКСТ", x: 0.5, y: 0.9 },
];

export type LayoutPreset = {
  id: LayoutPresetId;
  name: string;
  fontSize: number;
  positions: Record<"top" | "bottom", { x: number; y: number }>;
};

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: "classic",
    name: "Классика",
    fontSize: 0.088,
    positions: {
      top: { x: 0.5, y: 0.1 },
      bottom: { x: 0.5, y: 0.9 },
    },
  },
  {
    id: "panels",
    name: "Две панели",
    fontSize: 0.08,
    positions: {
      top: { x: 0.5, y: 0.25 },
      bottom: { x: 0.5, y: 0.75 },
    },
  },
  {
    id: "top",
    name: "Только верх",
    fontSize: 0.1,
    positions: {
      top: { x: 0.5, y: 0.12 },
      bottom: { x: 0.5, y: 1.2 },
    },
  },
  {
    id: "bottom",
    name: "Только низ",
    fontSize: 0.1,
    positions: {
      top: { x: 0.5, y: -0.2 },
      bottom: { x: 0.5, y: 0.9 },
    },
  },
  {
    id: "center",
    name: "Центр",
    fontSize: 0.092,
    positions: {
      top: { x: 0.5, y: 0.44 },
      bottom: { x: 0.5, y: 0.58 },
    },
  },
  {
    id: "poster",
    name: "Плакат",
    fontSize: 0.13,
    positions: {
      top: { x: 0.5, y: 0.5 },
      bottom: { x: 0.5, y: 0.88 },
    },
  },
];

export function applyLayoutPreset(
  captions: Caption[],
  preset: LayoutPreset,
): Caption[] {
  return captions.map((caption) => ({
    ...caption,
    x: preset.positions[caption.id].x,
    y: preset.positions[caption.id].y,
  }));
}
