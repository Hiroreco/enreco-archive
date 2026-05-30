import type { Choice } from "../../types";

export const betrayFamilyChoice: Choice = {
    id: "betrayFamily",
    question: {
        en: "If your friend told you to betray your family, who would you choose?",
        ja: "もし友達に家族を裏切るよう言われたら、どちらを選びますか？",
    },
    type: "multi",
    options: [
        {
            label: {
                en: "Friend",
                ja: "友達",
            },
            members: [],
        },
        {
            label: {
                en: "Family",
                ja: "家族",
            },
            members: ["mococo"],
        },
        {
            label: {
                en: "Myself",
                ja: "自分自身",
            },
            members: ["fuwawa", "nerissa", "bae", "shiori", "bijou", "raora"],
        },
    ],
};
