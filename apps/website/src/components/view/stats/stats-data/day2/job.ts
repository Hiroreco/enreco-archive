import type { ContinuousChoice } from "../../types";

export const jobChoice: ContinuousChoice = {
  id: "job",
  title: { en: "Job class", ja: "職業クラス" },
  options: [
    {
      label: { en: "Warrior", ja: "戦士" },
      color: "#E24B4A",
      members: ["calli", "kiara", "bae", "ame"],
    },
    {
      label: { en: "Mage", ja: "魔法使い" },
      color: "#7F77DD",
      members: ["ina", "kronii", "shiori"],
    },
    {
      label: { en: "Healer", ja: "ヒーラー" },
      color: "#1D9E75",
      members: ["fauna", "irys", "mumei"],
    },
    {
      label: { en: "Rogue", ja: "盗賊" },
      color: "#BA7517",
      members: ["gura", "bijou"],
    },
    {
      label: { en: "Bard", ja: "吟遊詩人" },
      color: "#D4537E",
      members: ["nerissa", "fuwawa", "mococo"],
    },
  ],
};
