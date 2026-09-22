import { create } from "zustand";
import {
  applyLayoutPreset,
  DEFAULT_CAPTIONS,
  DEFAULT_STYLE,
  LAYOUT_PRESETS,
} from "@/lib/meme/presets";
import { DEFAULT_TEMPLATE_ID, getTemplate } from "@/lib/meme/templates";
import type {
  Caption,
  CaptionId,
  ImageSource,
  LayoutPresetId,
  MemeStyle,
} from "@/lib/meme/types";

type MemeState = {
  image: ImageSource;
  captions: Caption[];
  style: MemeStyle;
  selectedId: CaptionId;
  presetId: LayoutPresetId;
  setCaptionText: (id: CaptionId, text: string) => void;
  setCaptionPos: (id: CaptionId, x: number, y: number) => void;
  setStyle: (patch: Partial<MemeStyle>) => void;
  selectCaption: (id: CaptionId) => void;
  applyPreset: (id: LayoutPresetId) => void;
  setTemplate: (templateId: string) => void;
  setUpload: (src: string, name: string) => void;
  reset: () => void;
};

const defaultTemplate = getTemplate(DEFAULT_TEMPLATE_ID);

export const useMemeStore = create<MemeState>((set) => ({
  image: {
    src: defaultTemplate.src,
    templateId: defaultTemplate.id,
    name: defaultTemplate.name,
  },
  captions: DEFAULT_CAPTIONS.map((c) => ({ ...c })),
  style: { ...DEFAULT_STYLE },
  selectedId: "top",
  presetId: "classic",

  setCaptionText: (id, text) =>
    set((state) => ({
      captions: state.captions.map((c) => (c.id === id ? { ...c, text } : c)),
    })),

  setCaptionPos: (id, x, y) =>
    set((state) => ({
      captions: state.captions.map((c) =>
        c.id === id
          ? { ...c, x: clamp(x, 0.08, 0.92), y: clamp(y, 0.05, 0.95) }
          : c,
      ),
    })),

  setStyle: (patch) =>
    set((state) => ({
      style: { ...state.style, ...patch },
    })),

  selectCaption: (id) => set({ selectedId: id }),

  applyPreset: (id) => {
    const preset = LAYOUT_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    set((state) => ({
      presetId: id,
      captions: applyLayoutPreset(state.captions, preset),
      style: { ...state.style, fontSize: preset.fontSize },
    }));
  },

  setTemplate: (templateId) => {
    const template = getTemplate(templateId);
    set({
      image: {
        src: template.src,
        templateId: template.id,
        name: template.name,
      },
    });
  },

  setUpload: (src, name) =>
    set({
      image: { src, templateId: null, name },
    }),

  reset: () =>
    set({
      captions: DEFAULT_CAPTIONS.map((c) => ({ ...c })),
      style: { ...DEFAULT_STYLE },
      selectedId: "top",
      presetId: "classic",
    }),
}));

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
