import { Book, Monitor, Palette, Pencil } from "lucide-react";

export type Song = {
    title: string;
    info: string;
    originalUrl: string;
    sourceUrl: string;
    coverUrl: string;
    // The duration is in the format "mm:ss", only for representative purposes
    duration: string;
};

const iconSize = 20;
export const CONTRIBUTORS = [
    {
        role: "Organizer",
        icon: <Pencil size={iconSize} />,
        contributors: [
            {
                name: "Hiro",
                socials: "https://x.com/hiroavrs",
            },
        ],
    },
    {
        role: "Developer",
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
            {
                name: "goose",
                socials: "https://github.com/Pyreko",
            },
            {
                name: "GoldElysium",
                socials: "https://github.com/GoldElysium",
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
            {
                name: "keenbiscuit",
                socials: "https://x.com/keenbiscuit",
            },
            {
                name: "SuperAppleMan",
                socials: "https://x.com/KW7MD8FEWT7lMXx",
            },
        ],
    },
    {
        role: "Archiver",
        icon: <Book size={iconSize} />,
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
                name: "Rieght",
                socials: "https://www.youtube.com/@immergruenclips",
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
                name: "KugaGray",
                socials: "https://x.com/KuyaGray",
            },
            {
                name: "Minhatory",
                socials: "https://x.com/minhatory ",
            },
            {
                name: "TsukiBep",
                socials: "https://x.com/tsukibep",
            },
            {
                name: "Sloth",
                socials: "https://x.com/Sloth4784",
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
                name: "Squid",
                socials: "https://x.com/Squid_the_Weeb",
            },
            {
                name: "fast_as_nuk",
                socials: "https://x.com/fast_as_nuk",
            },
            {
                name: "Perks",
                socials: "https://x.com/PerksJAZZBERI",
            },
            {
                name: "esca",
                socials: "https://x.com/esca_prod",
            },
            {
                name: "tom8o",
                socials: "https://x.com/Tom_8o",
            },
            {
                name: "Aki",
                socials: "https://x.com/Aki_Zaychik",
            },
            {
                name: "dulce",
                socials: null,
            },
        ],
    },
];

export const SONGS: { [category: string]: Song[] } = {
    enreco: [
        {
            title: "Enigmatic Recollection Trailer Theme",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/enreco/enreco-trailer.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "01:30",
        },
        {
            title: "START AGAIN",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/enreco/enreco-start-again.mp3",
            coverUrl: "/images-opt/song-enreco-start-again.webp",
            duration: "03:40",
        },
        {
            title: "MONSTER",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/enreco/enreco-monster.mp3",
            coverUrl: "/images-opt/song-enreco-monster.webp",
            duration: "03:37",
        },
    ],
    ingame: [
        {
            title: "Arms Store Lost Slayers",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/ingame/ingame-arms-store-lost-slayers.mp3",
            coverUrl: "/images-opt/song-chapter-2.webp",
            duration: "00:48",
        },
        {
            title: "Fantasy Orchestra 02",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/ingame/ingame-fantasy-orchestra-02.mp3",
            coverUrl: "/images-opt/song-chapter-2.webp",
            duration: "03:13",
        },
        {
            title: "Honobono Fantasy RPG Village",
            info: "",
            originalUrl: "",
            sourceUrl:
                "/audio/songs/ingame/ingame-honobono-fantasy-rpg-village.mp3",
            coverUrl: "/images-opt/song-chapter-2.webp",
            duration: "01:29",
        },
        {
            title: "Prairie Village",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/ingame/ingame-prairie-village.mp3",
            coverUrl: "/images-opt/song-chapter-2.webp",
            duration: "01:10",
        },
    ],
    stream: [
        {
            title: "Baby in the Bushes",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/stream/stream-baby-in-the-bushes.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "02:01",
        },
        {
            title: "003 RPG Town",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/stream/stream-bgm-003-rpg-town.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "01:15",
        },
        {
            title: "Call of the Wind",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/stream/stream-call-of-the-wind.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "01:21",
        },
        {
            title: "Fantasy World Adventure",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/stream/stream-fantasy-world-adventure.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "02:19",
        },
        {
            title: "Kingdom",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/stream/stream-kingdom.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "02:44",
        },
        {
            title: "Lingering Memories",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/stream/stream-lingering-memories.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "02:10",
        },
        {
            title: "Mercantile Town",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/stream/stream-mercantile-town.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "01:25",
        },
        {
            title: "Meteor and Dragon",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/stream/stream-meteor-and-dragon.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "02:45",
        },
        {
            title: "Mosaic",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/stream/stream-mosaic.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "02:06",
        },
        {
            title: "My Kind of Illusion",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/stream/stream-my-kind-of-illusion.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "02:19",
        },
        {
            title: "Noir et Blanc",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/stream/stream-noir-et-blanc.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "02:48",
        },
        {
            title: "Our Last Hope",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/stream/stream-our-last-hope.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "02:42",
        },
        {
            title: "Shapes of Shadows",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/stream/stream-shapes-of-shadows.mp3",
            coverUrl: "/images-opt/song-chapter-1s.webp",
            duration: "03:27",
        },
        {
            title: "The Cost of Fear",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/stream/stream-the-cost-of-fear.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "00:33",
        },
        {
            title: "The Scent of Petrichor",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/stream/stream-the-scent-of-petrichor.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "02:32",
        },
        {
            title: "Velada Romantica",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/stream/stream-velada-romantica.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "03:08",
        },
        {
            title: "灯火",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/stream/stream-灯火.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "01:16",
        },
        {
            title: "風の声",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/stream/stream-風の声.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "01:26",
        },
        {
            title: "魂の還る場所",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/stream/stream-魂の還る場所.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "01:23",
        },
    ],
    talent: [
        {
            title: "Excuse My Rudeness, But Could You Please RIP?",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/talent/talent-rip.mp3",
            coverUrl: "/images-opt/song-talent-rip.webp",
            duration: "03:12",
        },

        {
            title: "Reflect",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/talent/talent-reflect.mp3",
            coverUrl: "/images-opt/song-talent-reflect.webp",
            duration: "04:08",
        },

        {
            title: "Violet",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/talent/talent-violet.mp3",
            coverUrl: "/images-opt/song-talent-violet.webp",
            duration: "03:27",
        },
        {
            title: "Hinotori",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/talent/talent-hinotori.mp3",
            coverUrl: "/images-opt/song-talent-hinotori.webp",
            duration: "03:53",
        },

        {
            title: "ChikuTaku",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/talent/talent-chikutaku.mp3",
            coverUrl: "/images-opt/song-talent-chikutaku.webp",
            duration: "04:01",
        },
        {
            title: "Caesura of Despair",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/talent/talent-caesura.mp3",
            coverUrl: "/images-opt/song-talent-caesura.webp",
            duration: "04:28",
        },

        {
            title: "Daydream",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/talent/talent-daydream.mp3",
            coverUrl: "/images-opt/song-talent-daydream.webp",
            duration: "04:16",
        },
        {
            title: "PLAY DICE",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/talent/talent-play-dice.mp3",
            coverUrl: "/images-opt/song-talent-play-dice.webp",
            duration: "03:43",
        },
    ],
    instrumental: [
        {
            title: "START AGAIN (Instrumental)",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/enreco/enreco-start-again-ins.mp3",
            coverUrl: "/images-opt/song-enreco-start-again.webp",
            duration: "03:40",
        },
        {
            title: "MONSTER (Instrumental)",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/enreco/enreco-monster-ins.mp3",
            coverUrl: "/images-opt/song-enreco-monster.webp",
            duration: "03:16",
        },
        {
            title: "Excuse My Rudeness, But Could You Please RIP? (Instrumental)",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/talent/talent-rip-ins.mp3",
            coverUrl: "/images-opt/song-talent-rip.webp",
            duration: "03:12",
        },
        {
            title: "Reflect (Instrumental)",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/talent/talent-reflect-ins.mp3",
            coverUrl: "/images-opt/song-talent-reflect.webp",
            duration: "04:08",
        },
        {
            title: "Violet (Instrumental)",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/talent/talent-violet-ins.mp3",
            coverUrl: "/images-opt/song-talent-violet.webp",
            duration: "03:27",
        },
        {
            title: "Hinotori (Instrumental)",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/talent/talent-hinotori-ins.mp3",
            coverUrl: "/images-opt/song-talent-hinotori.webp",
            duration: "03:53",
        },
        {
            title: "ChikuTaku (Instrumental)",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/talent/talent-chikutaku-ins.mp3",
            coverUrl: "/images-opt/song-talent-chikutaku.webp",
            duration: "03:30",
        },
        {
            title: "Caesura of Despair (Instrumental)",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/talent/talent-caesura-ins.mp3",
            coverUrl: "/images-opt/song-talent-caesura.webp",
            duration: "04:28",
        },

        {
            title: "Daydream (Instrumental)",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/talent/talent-daydream-ins.mp3",
            coverUrl: "/images-opt/song-talent-daydream.webp",
            duration: "04:16",
        },

        {
            title: "PLAY DICE (Instrumental)",
            info: "",
            originalUrl: "",
            sourceUrl: "/audio/songs/talent/talent-play-dice-ins.mp3",
            coverUrl: "/images-opt/song-talent-play-dice.webp",
            duration: "03:44",
        },
    ],
};
