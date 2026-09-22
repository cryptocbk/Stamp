export type CaptionId = "top" | "bottom";

export type Caption = {
  id: CaptionId;
  text: string;
  x: number;
  y: number;
};

export type CaptionLayout = {
  id: CaptionId;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type MemeStyle = {
  fontSize: number;
  strokeWidth: number;
  allCaps: boolean;
  fillColor: string;
  strokeColor: string;
};

export type ImageSource = {
  src: string;
  templateId: string | null;
  name: string;
};

export type LayoutPresetId =
  | "classic"
  | "panels"
  | "top"
  | "bottom"
  | "center"
  | "poster";
