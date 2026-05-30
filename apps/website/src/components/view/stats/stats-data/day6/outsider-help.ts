import type { Choice } from "../../types";

export const outsiderHelpChoice: Choice = {
    id: "outsiderHelp",
    question: {
        en: "Will you lend the Outsider your power to make all the worlds anew?",
        ja: "あなたはアウトサイダーに力を貸して、すべての世界を新しくしますか？",
    },
    type: "multi",
    options: [
        {
            label: {
                en: "Yes",
                ja: "はい",
            },
            members: ["shiori", "bijou", "mococo", "fuwawa", "nerissa", "irys"],
        },
        {
            label: {
                en: "No",
                ja: "いいえ",
            },
            members: [
                "calli",
                "ina",
                "kronii",
                "bae",
                "ceci",
                "gigi",
                "raora",
                "liz",
            ],
        },
    ],
};
