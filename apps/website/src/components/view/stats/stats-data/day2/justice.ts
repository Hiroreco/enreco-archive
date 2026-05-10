import type { Choice } from "../../types";

export const justiceChoice: Choice = {
    id: "justice",
    question: {
        en: "Which Justice member would you make out with?",
        ja: "Justiceメンバーの誰とイチャイチャしたい？",
    },
    type: "multi",
    options: [
        {
            label: { en: "Gonathon", ja: "ゴナソン" },
            members: ["calli", "kronii", "bae", "fuwawa", "mococo"],
        },
        {
            label: { en: "Cecilia", ja: "セシリア" },
            members: ["ina", "fauna", "shiori"],
        },
        {
            label: { en: "Elizabeth", ja: "エリザベス" },
            members: ["gura", "mumei", "bijou", "kiara"],
        },
        {
            label: { en: "Raora", ja: "ラオラ" },
            members: ["ame", "irys", "nerissa"],
        },
    ],
};
