import { Locale } from "@/store/settingStore";
import {
    Image,
    Languages,
    Monitor,
    NotebookPen,
    Palette,
    SquareCheckBig,
    SquarePen,
    Star,
} from "lucide-react";

const iconSize = 20;
export const CONTRIBUTORS = [
    {
        role: "Project Lead",
        icon: <Star size={iconSize} />,
        contributors: [
            {
                name: "Hiro",
                socials: "https://x.com/hiroavrs",
            },
        ],
    },
    {
        role: "Main Developer",
        icon: <Monitor size={iconSize} />,
        contributors: [
            {
                name: "Tactician_Walt",
                socials: "https://x.com/Walt280",
            },
            {
                name: "Hiro",
                socials: "https://x.com/hiroavrs",
            },
        ],
    },
    {
        role: "Translation Assistant",
        icon: <Languages size={iconSize} />,
        contributors: [
            {
                name: "ふうげつどう",
                socials: "https://x.com/elu_live",
            },
            {
                name: "アーク•カデンザー",
                socials: "https://x.com/arkcadenza22",
            },
            {
                name: "Jailbird Union",
                socials: "https://x.com/JailbirdUnion",
            },
        ],
    },
    {
        role: "Site Graphics",
        icon: <Palette size={iconSize} />,
        contributors: [
            {
                name: "Quarases",
                socials: "https://x.com/Quarases_",
            },
            {
                name: "A1on",
                socials: "https://x.com/_a1on",
            },
        ],
    },
    {
        role: "Special Assets",
        icon: <Image size={iconSize} />,
        contributors: [
            {
                name: "Soleiss",
                socials: "https://x.com/S0LCreations",
            },
            {
                name: "DDOLBANG",
                socials: "https://x.com/DDOLBANG11",
            },
            {
                name: "keenbiscuit",
                socials: "https://x.com/keenbiscuit",
            },
            {
                name: "SuperAppleMan",
                socials: "https://x.com/KW7MD8FEWT7lMXx",
            },
            {
                name: "Mooon",
                socials: "https://x.com/Moon_LDL",
            },
            {
                name: "kudaran",
                socials: "https://x.com/kudarannnS",
            },
        ],
    },
    {
        role: "Quality Assurance",
        icon: <SquareCheckBig size={iconSize} />,
        contributors: [
            {
                name: "Sloth",
                socials: "https://x.com/Sloth4784",
            },
            {
                name: "fast_as_nuk",
                socials: "https://x.com/fast_as_nuk",
            },
            {
                name: "fireycar",
                socials: null,
            },
        ],
    },
    {
        role: "Archive Assistant",
        icon: <SquarePen size={iconSize} />,
        contributors: [
            {
                name: "Rieght",
                socials: "https://www.youtube.com/@immerchive",
            },
            {
                name: "dulce",
                socials: null,
            },
            {
                name: "Squid",
                socials: "https://x.com/Squid_the_Weeb",
            },
            {
                name: "Minhatory",
                socials: "https://x.com/minhatory ",
            },
            {
                name: "tom8o",
                socials: "https://x.com/Tom_8o",
            },
            {
                name: "Aki",
                socials: "https://x.com/Aki_Zaychik",
            },
        ],
    },
    {
        role: "Archive Writer",
        icon: <NotebookPen size={iconSize} />,
        contributors: [
            {
                name: "Hiro",
                socials: "https://x.com/hiroavrs",
            },
            {
                name: "Zephyr Kitten",
                socials: "https://x.com/ZephyrKitten",
            },

            {
                name: "Fayelinya Luna",
                socials: "https://fayelinyaluna.carrd.co/",
            },
            {
                name: "Alfy",
                socials: "https://x.com/knightalfy",
            },
            {
                name: "KuyaGray",
                socials: "https://x.com/KuyaGray",
            },

            {
                name: "TsukiBep",
                socials: "https://x.com/tsukibep",
            },

            {
                name: "SB",
                socials: "https://x.com/SBERBholo",
            },
            {
                name: "Zel",
                socials: "https://x.com/zelmaelstrom",
            },

            {
                name: "Perks",
                socials: "https://x.com/PerksJAZZBERI",
            },
            {
                name: "esca",
                socials: "https://x.com/esca_prod",
            },
        ],
    },
];

export const CHARACTER_ID_NAME_MAP_EN: Record<string, string> = {
    ame: "Amelia Watson",
    ina: "NinoIna",
    gura: "Gawr Gura",
    kiara: "Tanakisha Karia",
    calli: "Mori Calliope",
    moom: "Nanamoo",
    fauna: "Ceres Fauna",
    kronii: "Tam Gandr",
    irys: "Hot Pink One",
    bae: "Peasant the Bae",
    fuwawa: "Fuwawa Abyssguard",
    mococo: "Mococo Abyssguard",
    shiori: "Shiori Nyavella",
    nerissa: "Nerissa Juliet Ravencroft",
    bijou: "Koseki Bijou",
    liz: "Elizabeth Rose Bloodflame",
    gigi: "Gonathon G",
    cecilia: "Cecilia Immergreen",
    raora: "Raora Panthera",
    iphania: "Iphania",
};

export const CHARACTER_ID_NAME_MAP_JA: Record<string, string> = {
    ame: "アメリア・ワトソン",
    ina: "ニノイナ",
    gura: "がうる・ぐら",
    kiara: "タナキシャ・カリア",
    calli: "森カリオペ",
    moom: "ナナムー",
    fauna: "セレス・ファウナ",
    kronii: "タム・ガンドル",
    irys: "ホットピンクワン",
    bae: "ペザント・ザ・ベー",
    fuwawa: "フワワ・アビスガード",
    mococo: "モココ・アビスガード",
    shiori: "シオリ・ニャヴェラ",
    nerissa: "ネリッサ・ジュリエット・レイヴンクロフト",
    bijou: "古石ビジュー",
    liz: "エリザベス・ローズ・ブラッドフレイム",
    gigi: "ゴナソン・G",
    cecilia: "セシリア・イマーグリーン",
    raora: "ラオラ・パンテラ",
    iphania: "イファニア",
};

export const getCharacterIdNameMap = (
    chapter = 0,
    locale: Locale = "en",
): Record<string, string> => {
    const baseMap =
        locale === "ja" ? CHARACTER_ID_NAME_MAP_JA : CHARACTER_ID_NAME_MAP_EN;

    if (chapter === 0) {
        return { ...baseMap };
    }
    if (chapter === 1) {
        if (locale === "ja") {
            return {
                ...baseMap,
                cecilia: "セシリア・セシリア・イマーカインド",
                raora: "ロア・パンドラ",
                calli: "モーダン・ラムジー",
            };
        }
        return {
            ...baseMap,
            cecilia: "Cecilia Immerkind",
            raora: "Roa Pandora",
            calli: "Mordan Ramsey",
        };
    }
    return baseMap;
};

export const CHARACTER_ORDER = [
    "ame",
    "gura",
    "calli",
    "kiara",
    "ina",
    "irys",
    "kronii",
    "bae",
    "fauna",
    "moom",
    "bijou",
    "nerissa",
    "shiori",
    "fuwawa",
    "mococo",
    "liz",
    "cecilia",
    "gigi",
    "raora",
    "iphania",
];

/**
 * Sorts an array based on a predefined order array
 * @param items - Array of items to sort
 * @param orderArray - Array defining the desired order
 * @param getKey - Function to extract the key from each item (defaults to identity)
 * @param fallbackSort - How to sort items not in orderArray ('start' | 'end' | 'alphabetical')
 */
export function sortByPredefinedOrder<T>(
    items: T[],
    orderArray: string[],
    getKey: (item: T) => string = (item) => String(item),
    fallbackSort: "start" | "end" | "alphabetical" = "end",
): T[] {
    const orderMap = new Map(orderArray.map((key, index) => [key, index]));

    const tmp = [...items].sort((a, b) => {
        const keyA = getKey(a);
        const keyB = getKey(b);

        const indexA = orderMap.get(keyA);
        const indexB = orderMap.get(keyB);

        // Both items are in the order array
        if (indexA !== undefined && indexB !== undefined) {
            return indexA - indexB;
        }

        // Only A is in the order array
        if (indexA !== undefined && indexB === undefined) {
            return fallbackSort === "start" ? 1 : -1;
        }

        // Only B is in the order array
        if (indexA === undefined && indexB !== undefined) {
            return fallbackSort === "start" ? -1 : 1;
        }

        // Neither is in the order array
        if (fallbackSort === "alphabetical") {
            return keyA.localeCompare(keyB);
        }
        // Keep original order for items not in orderArray
        return 0;
    });
    return tmp;
}
