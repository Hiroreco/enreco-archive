import type { Choice } from "../../types";

export const weaponChoice: Choice = {
  id: "weapon",
  question: "Which weapon would you wield in battle?",
  type: "multi",
  options: [
    { label: "Sword", members: ["calli", "kiara", "kronii", "bae"] },
    { label: "Staff", members: ["ina", "fauna", "shiori"] },
    { label: "Bow", members: ["gura", "mumei", "bijou"] },
    {
      label: "Dagger",
      members: ["ame", "irys", "nerissa", "fuwawa", "mococo"],
    },
  ],
};
