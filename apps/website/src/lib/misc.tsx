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

export type Contributor = {
    name: string;
    socials: string | null;
    credits?: {
        en: string[];
        ja?: string[];
    };
};

export type Credit = {
    role: string;
    icon: React.JSX.Element;
    contributors: Contributor[];
};

const iconSize = 20;
export const CONTRIBUTORS: Credit[] = [
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
                name: "Hiro",
                socials: "https://x.com/hiroavrs",
            },
            {
                name: "Tactician_Walt",
                socials: "https://x.com/Walt280",
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
                socials: "https://www.reddit.com/user/Zestyclose_Public372/",
            },
            {
                name: "Derpizard",
                socials: "https://x.com/VoltWag23",
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
                name: "Minhatory",
                socials: "https://x.com/minhatory ",
            },
            {
                name: "abnlib",
                socials: null,
            },
            {
                name: "Beeswithgunz",
                socials: "https://x.com/Beeswithgunz",
            },
            {
                name: "Hell-Yum",
                socials: null,
            },
            {
                name: "Javerend",
                socials: null,
            },
            {
                name: "kaitokei",
                socials: "https://x.com/kaitokei",
            },
            {
                name: "NairaOo",
                socials: null,
            },
            {
                name: "Bonitto G",
                socials: null,
            },
            {
                name: "RayIsMob",
                socials: null,
            },
            {
                name: "Frostywaffle",
                socials: null,
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
                credits: {
                    en: ["Too many to list out"],
                    ja: ["挙げきれないほどたくさん"],
                },
            },
            {
                name: "Zephyr Kitten",
                socials: "https://x.com/ZephyrKitten",
                credits: {
                    en: ["Chapter 2, 3: Gigi related entries"],
                    ja: ["第2章：ジジ関連のエントリー"],
                },
            },
            {
                name: "Squid",
                socials: "https://x.com/Squid_the_Weeb",
                credits: {
                    en: ["Chapter 3: Calli, Mococo related entries"],
                    ja: ["第3章：カリ、モココ関連のエントリー"],
                },
            },
            {
                name: "SteelPokeNinja",
                socials: "https://x.com/SteelPokeNinja",
                credits: {
                    en: ["Chapter 3: Bijou related entries"],
                    ja: ["第3章：ビジュー関連のエントリー"],
                },
            },
            {
                name: "Derpizard",
                socials: "https://x.com/VoltWag23",
                credits: {
                    en: ["Chapter 3: Ina related entries"],
                    ja: ["第3章：イナ関連のエントリー"],
                },
            },
            {
                name: "Alfy",
                socials: "https://x.com/knightalfy",
                credits: {
                    en: ["Chapter 2, 3: Bae, Shiori related entries"],
                    ja: ["第2章：ベー、シオリ関連のエントリー"],
                },
            },
            {
                name: "KuyaGray",
                socials: "https://x.com/KuyaGray",
                credits: {
                    en: ["Chapter 2, 3: Cecilia related entries"],
                    ja: ["第2章：セシリア関連のエントリー"],
                },
            },
            {
                name: "SB",
                socials: "https://x.com/SBERBholo",
                credits: {
                    en: ["Chapter 2, 3: Elizabeth related entries"],
                    ja: ["第2章：エリザベス関連のエントリー"],
                },
            },
            {
                name: "Hashbrownui",
                socials: "https://x.com/Hashbrownui",
                credits: {
                    en: ["Chapter 3: Elizabeth related entries"],
                    ja: ["第2章：エリザベス関連のエントリー"],
                },
            },
            {
                name: "Zel",
                socials: "https://x.com/zelmaelstrom",
                credits: {
                    en: ["Chapter 2, 3: Nerissa related entries"],
                    ja: ["第2章：ネリッサ関連のエントリー"],
                },
            },
            {
                name: "Perks",
                socials: "https://x.com/PerksJAZZBERI",
                credits: {
                    en: ["Chapter 2, 3: Kiara related entries"],
                    ja: ["第2章：キアラ関連のエントリー"],
                },
            },
            {
                name: "tom8o",
                socials: "https://x.com/Tom_8o",
                credits: {
                    en: ["Chapter 2, 3: Gigi related entries"],
                    ja: ["第2章：ジジ関連のエントリー"],
                },
            },
            {
                name: "SteelPokeNinja",
                socials: "https://x.com/SteelPokeNinja",
                credits: {
                    en: ["Chapter 3: Bijou related entries"],
                    ja: ["第3章：ビジュー関連のエントリー"],
                },
            },
            {
                name: "Seventysix",
                socials: "https://x.com/Victory7TCX",
                credits: {
                    en: ["Chapter 3: Raora related entries"],
                    ja: ["第3章：ラオラ関連のエントリー"],
                },
            },
            {
                name: "Fayelinya Luna",
                socials: "https://fayelinyaluna.carrd.co/",
                credits: {
                    en: ["Chapter 2: Bijou related entries"],
                    ja: ["第2章：ビジュー関連のエントリー"],
                },
            },
            {
                name: "esca",
                socials: "https://x.com/esca_prod",
                credits: {
                    en: ["Chapter 2: Kronii related entries"],
                    ja: ["第2章：クロニー関連のエントリー"],
                },
            },
            {
                name: "TsukiBep",
                socials: "https://x.com/tsukibep",
                credits: {
                    en: ["Chapter 2: Ina related entries"],
                    ja: ["第2章：イナ関連のエントリー"],
                },
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
    fuwawa: "Fuwawa Abyssgard",
    mococo: "Mococo Abyssgard",
    shiori: "Shiori Nyavella",
    nerissa: "Nerissa Juliet Ravencroft",
    bijou: "Koseki Bijou",
    liz: "Elizabeth Rose Bloodflame",
    gigi: "Gonathon G",
    cecilia: "Cecilia Immergreen",
    raora: "Raora Panthera",
    iphania: "Iphania",
    nix: "Nix",
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
    nix: "ニックス",
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
            liz: "Lady Elizabeth Bloodflame"
        };
    }
     if (chapter === 2) {
        if (locale === "ja") {
            return {
                ...baseMap,
                cecilia: "ナイト・イマーカインド",
                raora: "ロア",
                calli: "モルドン・ラムゼイ",
                bae: "ペイザン・ザ・ベイ",
                liz: "レディ・エリザベス・ブラッドフレイム",
                bijou: "呪われしビジュー",
                mococo: "小さな魔女 モココ・アビスガード",
                shiori: "シスター・シオリ",
                kiara: "シャキーラ",
            };
        }
        return {
            ...baseMap,
            cecilia: "Knight Immerkind",
            raora: "Roa",
            calli: "Mordon Ramsay",
            bae: "Peasant Bae",
            liz: "Lady Elizabeth Bloodflame",
            bijou: "Bijou the Stained",
            mococo: "Little Witch Mococo",
            shiori: "Sister Shiori",
            kiara: "Shakira"
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
    "nix",
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
