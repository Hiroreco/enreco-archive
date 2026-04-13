import type { Choice } from "../../types";

export const pizzaChoice: Choice = {
  id: "pizza",
  question: { en: "Do you find pineapple on pizza acceptable?", ja: "ピザにパイナップルをのせるのは許容できますか？" },
  type: "yesno",
  options: [
    { label: { en: "Yes", ja: "はい" }, members: ["kiara", "ame", "bae", "fuwawa"] },
    {
      label: { en: "No", ja: "いいえ" },
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
