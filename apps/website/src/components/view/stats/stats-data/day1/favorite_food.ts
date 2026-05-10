import type { ContinuousChoice } from "../../types";

export const favoriteFood: ContinuousChoice = {
  id: "favorite_food",
  title: { en: "Favorite food", ja: "好物" },
  options: [
    {
      label: { en: "Potato Salad", ja: "ポテトサラダ" },
      color: "#E5A663",
      members: ["calli", "ina", "fauna", "kronii", "shiori"],
    },
    {
      label: { en: "Stain Milkshake", ja: "ステインミルクシェイク" },
      color: "#639922",
      members: ["kiara", "gura", "irys", "mumei"],
    },
    {
      label: { en: "Milkshake", ja: "ミルクシェイク" },
      color: "#185FA5",
      members: ["ame", "bijou", "nerissa"],
    },
    {
      label: { en: "Pizza with Pineapple", ja: "パイナップル付きピザ" },
      color: "#BA7517",
      members: ["bae", "fuwawa", "mococo"],
    },
  ],
};

