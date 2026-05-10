import type { Choice } from "../../types";

export const petChoice: Choice = {
    id: "pet",
    question: {
        en: "What pet would you choose as a companion?",
        ja: "コンパニオンペットとしてどんなペットを選びますか？",
    },
    type: "multi",
    options: [
        {
            label: { en: "Cat", ja: "猫" },
            members: ["ina", "fauna", "kronii", "shiori"],
        },
        {
            label: { en: "Dog", ja: "犬" },
            members: ["kiara", "gura", "ame", "bae", "fuwawa", "mococo"],
        },
        {
            label: { en: "Bird", ja: "鳥" },
            members: ["calli", "irys", "nerissa"],
        },
        { label: { en: "Fish", ja: "魚" }, members: ["bijou", "mumei"] },
    ],
};
