import type { Choice } from "../../types";

export const pizzaChoice: Choice = {
  id: "pizza",
  question: "Do you find pineapple on pizza acceptable?",
  type: "yesno",
  options: [
    { label: "Yes", members: ["kiara", "ame", "bae", "fuwawa"] },
    {
      label: "No",
      members: [
        "calli",
        "ina",
        "gura",
        "fauna",
        "kronii",
        "mumei",
        "irys",
        "bijou",
        "nerissa",
        "mococo",
        "shiori",
      ],
    },
  ],
};
