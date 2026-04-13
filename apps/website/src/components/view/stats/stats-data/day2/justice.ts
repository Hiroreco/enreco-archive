import type { Choice } from "../../types";

export const justiceChoice: Choice = {
  id: "justice",
  question: "Which Justice member would you make out with?",
  type: "multi",
  options: [
    {
      label: "Gonathon",
      members: ["calli", "kronii", "bae", "fuwawa", "mococo"],
    },
    { label: "Cecilia", members: ["ina", "fauna", "shiori"] },
    { label: "Elizabeth", members: ["gura", "mumei", "bijou", "kiara"] },
    { label: "Raora", members: ["ame", "irys", "nerissa"] },
  ],
};
