import type { Choice } from "../../types";

export const faustDealChoice: Choice = {
    id: "faustDeal",
    question: {
        en: "Did they accept Faust's deal?",
        ja: "ファウストの契約を受け入れましたか？",
    },
    type: "multi",
    options: [
        {
            label: { en: "Accept", ja: "受け入れる" },
            members: [
                "shiori",
                "bijou",
                "nerissa",
                "mococo",
                "fuwawa",
                "cecilia",
                "raora",
                "liz",
                "ina",
                "bae",
                "kronii",
                "irys",
            ],
        },
        {
            label: { en: "Refuse", ja: "拒否する" },
            members: ["gigi", "calli"],
        },
    ],
};
