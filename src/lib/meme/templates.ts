export type MemeTemplate = {
  id: string;
  name: string;
  src: string;
  kind: "photo" | "blank";
};

const asset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

export const MEME_TEMPLATES: MemeTemplate[] = [
  {
    id: "table-cat",
    name: "Кот за столом",
    src: asset("templates/table-cat.jpg"),
    kind: "photo",
  },
  {
    id: "cool-dog",
    name: "Крутой пёс",
    src: asset("templates/cool-dog.jpg"),
    kind: "photo",
  },
  {
    id: "this-is-fine",
    name: "Всё нормально",
    src: asset("templates/this-is-fine.jpg"),
    kind: "photo",
  },
  {
    id: "victory",
    name: "Успех",
    src: asset("templates/victory.jpg"),
    kind: "photo",
  },
  {
    id: "two-buttons",
    name: "Две кнопки",
    src: asset("templates/two-buttons.jpg"),
    kind: "photo",
  },
  {
    id: "confused",
    name: "Непонятно",
    src: asset("templates/confused.jpg"),
    kind: "photo",
  },
  {
    id: "shock",
    name: "Шок",
    src: asset("templates/shock.jpg"),
    kind: "photo",
  },
  {
    id: "whiteboard",
    name: "Презентация",
    src: asset("templates/whiteboard.jpg"),
    kind: "photo",
  },
  {
    id: "nope-yes",
    name: "Отказ",
    src: asset("templates/nope-yes.jpg"),
    kind: "photo",
  },
  {
    id: "split",
    name: "Две панели",
    src: asset("templates/split.svg"),
    kind: "blank",
  },
  {
    id: "ink",
    name: "Чернила",
    src: asset("templates/ink.svg"),
    kind: "blank",
  },
  {
    id: "paper",
    name: "Бумага",
    src: asset("templates/paper.svg"),
    kind: "blank",
  },
];

export const DEFAULT_TEMPLATE_ID = "table-cat";

export function getTemplate(id: string) {
  return MEME_TEMPLATES.find((t) => t.id === id) ?? MEME_TEMPLATES[0];
}
