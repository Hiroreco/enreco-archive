import type { Choice } from "../../types";

export const weaponChoice: Choice = {
  id: "weapon",
  question: { en: "Which weapon would you wield in battle?", ja: "戦闘ではどの武器を振るいますか？" },
  type: "multi",
  options: [
    {
      label: { en: "Sword", ja: "剣" },
      members: ["calli", "kiara", "kronii", "bae"],
    },
    {
      label: { en: "Staff", ja: "杖" },
      members: ["ina", "fauna", "shiori"],
    },
    {
      label: { en: "Bow", ja: "弓" },
      members: ["gura", "mumei", "bijou"],
    },
    {
      label: { en: "Dagger", ja: "短剣" },
      members: ["ame", "irys", "nerissa", "fuwawa", "mococo"],
    },
  ],
};
