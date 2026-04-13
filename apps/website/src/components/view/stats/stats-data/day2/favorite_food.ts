import type { ContinuousChoice } from "../../types";

export const favoriteFood: ContinuousChoice = {
  id: "favorite_food",
  title: "Favorite food",
  options: [
    { label: "Potato Sald", color: "#E5A663", members: ["calli", "ina", "fauna"] },
    {
      label: "Stain Milkshake",
      color: "#639922",
      members: ["kiara", "gura", "irys", "mumei", "mococo"],
    },
    {
      label: "Milkshake",
      color: "#185FA5",
      members: ["ame", "bijou", "nerissa", "kronii", "shiori"],
    },
    {
      label: "Pizza on Pineapple",
      color: "#BA7517",
      members: ["bae", "fuwawa"],
    },
  ],
};
