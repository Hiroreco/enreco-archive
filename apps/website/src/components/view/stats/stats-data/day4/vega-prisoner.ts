import type { Choice } from "../../types";

export const whoToTalkToChoice: Choice = {
    id: "whoToTalkTo",
    question: {
        en: "Who to talk to",
        ja: "誰に話しかけるか",
    },
    type: "multi",
    options: [
        {
            label: {
                en: "Vega",
                ja: "ベガ",
            },
            members: ["liz", "gigi", "kronii"],
        },
        {
            label: {
                en: "Prisoner 0",
                ja: "囚人番号0",
            },
            members: ["nerissa", "mococo", "bae", "fuwawa", "raora"],
        },
    ],
};
