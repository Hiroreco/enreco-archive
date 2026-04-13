import type { ContinuousChoice } from "../../types";

export const jobChoice: ContinuousChoice = {
  id: "job",
  title: "Job class",
  options: [
    { label: "Warrior", color: "#E24B4A", members: ["calli", "kiara", "bae"] },
    { label: "Mage", color: "#7F77DD", members: ["ina", "kronii", "shiori"] },
    { label: "Healer", color: "#1D9E75", members: ["fauna", "irys", "mumei"] },
    { label: "Rogue", color: "#BA7517", members: ["gura", "ame", "bijou"] },
    {
      label: "Bard",
      color: "#D4537E",
      members: ["nerissa", "fuwawa", "mococo"],
    },
  ],
};
