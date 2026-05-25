import type { Choice } from "../../types";

export const starSpeakersChoice: Choice = {
    id: "starSpeakers",
    question: {
        en: "Did they lie to the Star Speakers?",
        ja: "彼らはスタースピーカーたちに嘘をついたのか？",
    },
    type: "multi",
    options: [
        {
            label: { en: "Truth", ja: "真実" },
            members: [
                "mococo",
                "gigi",
                "cecilia",
                "raora",
                "liz",
                "calli",
                "ina",
                "bae",
                "kronii",
            ],
        },
        {
            label: { en: "Lie", ja: "嘘" },
            members: ["shiori", "nerissa", "fuwawa", "irys", "bijou"],
        },
    ],
};
