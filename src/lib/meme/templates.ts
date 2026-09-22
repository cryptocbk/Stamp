export type MemeTemplate = {
  id: string;
  name: string;
  src: string;
  kind: "photo" | "blank";
};

export const MEME_TEMPLATES: MemeTemplate[] = [
  {
    id: "table-cat",
    name: "Кот за столом",
    src: "/templates/table-cat.jpg",
    kind: "photo",
  },
  {
    id: "cool-dog",
    name: "Крутой пёс",
    src: "/templates/cool-dog.jpg",
    kind: "photo",
  },
  {
    id: "this-is-fine",
    name: "Всё нормально",
    src: "/templates/this-is-fine.jpg",
    kind: "photo",
  },
  {
    id: "victory",
    name: "Успех",
    src: "/templates/victory.jpg",
    kind: "photo",
  },
  {
    id: "two-buttons",
    name: "Две кнопки",
    src: "/templates/two-buttons.jpg",
    kind: "photo",
  },
  {
    id: "confused",
    name: "Непонятно",
    src: "/templates/confused.jpg",
    kind: "photo",
  },
  {
    id: "shock",
    name: "Шок",
    src: "/templates/shock.jpg",
    kind: "photo",
  },
  {
    id: "whiteboard",
    name: "Презентация",
    src: "/templates/whiteboard.jpg",
    kind: "photo",
  },
  {
    id: "nope-yes",
    name: "Отказ",
    src: "/templates/nope-yes.jpg",
    kind: "photo",
  },
  {
    id: "split",
    name: "Две панели",
    src: "/templates/split.svg",
    kind: "blank",
  },
  {
    id: "ink",
    name: "Чернила",
    src: "/templates/ink.svg",
    kind: "blank",
  },
  {
    id: "paper",
    name: "Бумага",
    src: "/templates/paper.svg",
    kind: "blank",
  },
];

export const DEFAULT_TEMPLATE_ID = "table-cat";

export function getTemplate(id: string) {
  return MEME_TEMPLATES.find((t) => t.id === id) ?? MEME_TEMPLATES[0];
}
