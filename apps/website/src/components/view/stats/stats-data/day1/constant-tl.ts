import type { Choice } from "../../types";

export const constantLieChoice: Choice = {
    id: "constantLie",
    question: {
        en: "Did they lie to the Constant?",
        ja: "コンスタントに嘘をつきましたか？",
    },
    type: "multi",
    options: [
        {
            label: { en: "Truth", ja: "真実" },
            members: [
                "calli",
                "ina",
                "kronii", // Normalized from 'konii'
                "irys",
                "shiori",
                "bijou",
                "nerissa",
                "fuwawa",
                "mococo",
                "cecilia",
                "gigi",
                "liz",
                "raora",
            ],
        },
        {
            label: { en: "Lie", ja: "嘘" },
            members: [],
        },
    ],
};
