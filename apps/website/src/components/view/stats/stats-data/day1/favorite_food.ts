import type { ContinuousChoice } from "../../types";

export const favoriteFood: ContinuousChoice = {
  id: "favorite_food",
  title: "Favorite food",
  options: [
    {
      label: "Potato Sald",
      color: "#E5A663",
      members: ["calli", "ina", "fauna", "kronii", "shiori"],
    },
    {
      label: "Stain Milkshake",
      color: "#639922",
      members: ["kiara", "gura", "irys", "mumei"],
    },
    {
      label: "Milkshake",
      color: "#185FA5",
      members: ["ame", "bijou", "nerissa"],
    },
    {
      label: "Pizza on Pineapple",
      color: "#BA7517",
      members: ["bae", "fuwawa", "mococo"],
    },
  ],
};
