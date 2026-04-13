import type { Choice } from "../../types";

export const petChoice: Choice = {
  id: "pet",
  question: "What pet would you choose as a companion?",
  type: "multi",
  options: [
    { label: "Cat", members: ["ina", "fauna", "kronii", "shiori"] },
    { label: "Dog", members: ["kiara", "gura", "ame", "bae", "fuwawa", "mococo"] },
    { label: "Bird", members: ["calli", "irys", "nerissa"] },
    { label: "Fish", members: ["bijou", "mumei"] },
  ],
};
