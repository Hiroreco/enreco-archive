import { Song } from "@enreco-archive/common/types";
import { Book, Monitor, Palette, Pencil } from "lucide-react";

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
            title: "ENigmatic Recollection Trailer Theme",
            info: "Official trailer theme",
            originalUrl:
                "https://www.youtube.com/watch?v=OnMxjFRlywA&ab_channel=hololiveEnglish",
            sourceUrl: "/audio/songs/enreco/enreco-trailer.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "01:30",
        },
        {
            title: "START AGAIN",
            info: "Official song for Chapter 1",
            originalUrl:
                "https://www.youtube.com/watch?v=NoJImTCKgrY&ab_channel=Release-Topic",
            sourceUrl: "/audio/songs/enreco/enreco-start-again.mp3",
            coverUrl: "/images-opt/song-enreco-start-again.webp",
            duration: "03:40",
        },
        {
            title: "MONSTER",
            info: "Official song for Chapter 2",
            originalUrl:
                "https://www.youtube.com/watch?v=nUrITFpI85A&ab_channel=hololiveEnglish",
            sourceUrl: "/audio/songs/enreco/enreco-monster.mp3",
            coverUrl: "/images-opt/song-enreco-monster.webp",
            duration: "03:37",
        },
    ],
    ingame: [
        {
            title: "Fantasy Orchestra 02",
            info: "Theme of Libestal Castle (Chapter 2)",
            originalUrl: "https://audiostock.net/tracks/61836",
            sourceUrl: "/audio/songs/ingame/ingame-fantasy-orchestra-02.mp3",
            coverUrl: "/images-opt/song-chapter-2.webp",
            duration: "03:13",
        },
        {
            title: "Prairie Village",
            info: "Theme of General Area (Chapter 2)",
            originalUrl: "https://audiostock.net/tracks/891959",
            sourceUrl: "/audio/songs/ingame/ingame-prairie-village.mp3",
            coverUrl: "/images-opt/song-chapter-2.webp",
            duration: "01:10",
        },
        {
            title: "Honobono Fantasy RPG Village",
            info: "Theme of Wilderness (Chapter 2)",
            originalUrl: "https://audiostock.net/tracks/50035",
            sourceUrl:
                "/audio/songs/ingame/ingame-honobono-fantasy-rpg-village.mp3",
            coverUrl: "/images-opt/song-chapter-2.webp",
            duration: "01:29",
        },
        {
            title: "Arms Store Lost Slayers",
            info: "Theme of Cliffs of Sidero (Chapter 2)",
            originalUrl: "https://audiostock.net/tracks/895300",
            sourceUrl: "/audio/songs/ingame/ingame-arms-store-lost-slayers.mp3",
            coverUrl: "/images-opt/song-chapter-2.webp",
            duration: "00:48",
        },
        {
            title: "Yukyu no Narrator",
            info: "Theme of Lykeion Campus (Chapter 2)",
            originalUrl: "https://audiostock.net/tracks/50218",
            sourceUrl: "/audio/songs/ingame/ingame-yukyu-no-narrator.mp3",
            coverUrl: "/images-opt/song-chapter-2.webp",
            duration: "01:48",
        },
    ],
    stream: [
        {
            title: "003 RPG Town",
            info: "Used by Gura (Chapter 1)",
            originalUrl: "https://audiostock.net/tracks/50054",
            sourceUrl: "/audio/songs/stream/stream-bgm-003-rpg-town.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "01:15",
        },
        {
            title: "Fantasy World Adventure",
            info: "Used by Gura (Chapter 1)",
            originalUrl: "https://audiostock.net/tracks/726537",
            sourceUrl: "/audio/songs/stream/stream-fantasy-world-adventure.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "02:19",
        },
        {
            title: "Mercantile Town",
            info: "Used by Gura (Chapter 1)",
            originalUrl: "https://audiostock.net/tracks/44222",
            sourceUrl: "/audio/songs/stream/stream-mercantile-town.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "01:25",
        },
        {
            title: "Meteor and Dragon",
            info: "Used by Gura (Chapter 1)",
            originalUrl: "https://audiostock.net/tracks/614400",
            sourceUrl: "/audio/songs/stream/stream-meteor-and-dragon.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "02:45",
        },
        {
            title: "Call of the Wind",
            info: "Used by Mumei (Chapter 1)",
            originalUrl: "https://audiostock.net/tracks/491760",
            sourceUrl: "/audio/songs/stream/stream-call-of-the-wind.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "01:21",
        },
        {
            title: "Kingdom",
            info: "Used by Mumei (Chapter 1)",
            originalUrl: "https://audiostock.net/tracks/23573",
            sourceUrl: "/audio/songs/stream/stream-kingdom.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "02:44",
        },
        {
            title: "Baby in the Bushes",
            info: "Used by Elizabeth (Chapter 1)",
            originalUrl:
                "https://www.youtube.com/watch?v=2PfXoyLJ4pM&ab_channel=StationarySign-Topic",
            sourceUrl: "/audio/songs/stream/stream-baby-in-the-bushes.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "02:01",
        },
        {
            title: "Lingering Memories",
            info: "Used by Elizabeth (Chapter 1)",
            originalUrl:
                "https://www.youtube.com/watch?v=93oO8c90rCw&ab_channel=IsobelO%27Connor-Topic",
            sourceUrl: "/audio/songs/stream/stream-lingering-memories.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "02:10",
        },

        {
            title: "Mosaic",
            info: "Used by Elizabeth (Chapter 1)",
            originalUrl:
                "https://www.youtube.com/watch?v=iN1ISre4TMc&ab_channel=EthanSloan-Topic",
            sourceUrl: "/audio/songs/stream/stream-mosaic.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "02:06",
        },
        {
            title: "My Kind of Illusion",
            info: "Used by Elizabeth (Chapter 1)",
            originalUrl:
                "https://www.youtube.com/watch?v=8DQQXEbUTOI&ab_channel=JayVarton-Topic",
            sourceUrl: "/audio/songs/stream/stream-my-kind-of-illusion.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "02:19",
        },
        {
            title: "Noir et Blanc",
            info: "Used by Elizabeth (Chapter 1)",
            originalUrl:
                "https://www.youtube.com/watch?v=m9zPgzsxpoE&ab_channel=EpidemicClassical",
            sourceUrl: "/audio/songs/stream/stream-noir-et-blanc.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "02:48",
        },
        {
            title: "Our Last Hope",
            info: "Used by Elizabeth (Chapter 1)",
            originalUrl:
                "https://www.youtube.com/watch?v=1dNToz9ZWW0&ab_channel=DragonTamer-Topic",
            sourceUrl: "/audio/songs/stream/stream-our-last-hope.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "02:42",
        },
        {
            title: "Shapes of Shadows",
            info: "Used by Elizabeth (Chapter 1)",
            originalUrl:
                "https://www.youtube.com/watch?v=jJjDskJ0O5A&ab_channel=EpidemicClassical",
            sourceUrl: "/audio/songs/stream/stream-shapes-of-shadows.mp3",
            coverUrl: "/images-opt/song-chapter-1s.webp",
            duration: "03:27",
        },
        {
            title: "The Cost of Fear",
            info: "Used by Elizabeth (Chapter 1)",
            originalUrl:
                "https://www.youtube.com/watch?v=nkJGLNKUKpc&ab_channel=JonBj%C3%B6rk-Topic",
            sourceUrl: "/audio/songs/stream/stream-the-cost-of-fear.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "00:33",
        },
        {
            title: "The Scent of Petrichor",
            info: "Used by Elizabeth (Chapter 1)",
            originalUrl:
                "https://www.youtube.com/watch?v=3kShItptm-M&ab_channel=Epidemic",
            sourceUrl: "/audio/songs/stream/stream-the-scent-of-petrichor.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "02:32",
        },
        {
            title: "Velada Romantica",
            info: "Used by Elizabeth (Chapter 1)",
            originalUrl:
                "https://www.youtube.com/watch?v=CPPph-aQaAw&ab_channel=JohanGl%C3%B6ssner-Topic",
            sourceUrl: "/audio/songs/stream/stream-velada-romantica.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "03:08",
        },
        {
            title: "灯火",
            info: "Used by Ina (Chapter 1)",
            originalUrl:
                "https://www.youtube.com/watch?v=Qbq5X5QkzV0&ab_channel=Release-Topic",
            sourceUrl: "/audio/songs/stream/stream-灯火.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "01:16",
        },
        {
            title: "風の声",
            info: "Used by IRyS (Chapter 1)",
            originalUrl:
                "https://www.youtube.com/watch?v=CBtS2uob4Ik&t=2s&ab_channel=%E3%82%86%E3%81%86%E3%81%8D%E3%82%8F%E3%81%9F%E3%82%8B-Topic",
            sourceUrl: "/audio/songs/stream/stream-風の声.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "01:26",
        },
        {
            title: "魂の還る場所",
            info: "Used by Fuwamoco (Chapter 1)",
            originalUrl:
                "https://www.youtube.com/watch?v=XA7noHKe4sU&t=23s&ab_channel=DOVA-SYNDROMEYouTubeOfficial",
            sourceUrl: "/audio/songs/stream/stream-魂の還る場所.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "01:23",
        },
    ],
    talent: [
        {
            title: "Excuse My Rudeness, But Could You Please RIP?",
            info: "Obtained in the Underworld Dungeon",
            originalUrl:
                "https://www.youtube.com/watch?v=5y3xh8gs24c&ab_channel=MoriCalliopeCh.hololive-EN",
            sourceUrl: "/audio/songs/talent/talent-rip.mp3",
            coverUrl: "/images-opt/song-talent-rip.webp",
            duration: "03:12",
        },

        {
            title: "Reflect",
            info: "Obtained in the Underwater Dungeon",
            originalUrl:
                "https://www.youtube.com/watch?v=nCQ_zZIiGLA&ab_channel=GawrGuraCh.hololive-EN",
            sourceUrl: "/audio/songs/talent/talent-reflect.mp3",
            coverUrl: "/images-opt/song-talent-reflect.webp",
            duration: "04:08",
        },

        {
            title: "Violet",
            info: "Obtained in the Eldritch Horror Dungeon",
            originalUrl:
                "https://www.youtube.com/watch?v=8ZdLXELdF9Q&ab_channel=NinomaeIna%27nisCh.hololive-EN",
            sourceUrl: "/audio/songs/talent/talent-violet.mp3",
            coverUrl: "/images-opt/song-talent-violet.webp",
            duration: "03:27",
        },
        {
            title: "HINOTORI",
            info: "Obtained in the Volcanic Dungeon",
            originalUrl:
                "https://www.youtube.com/watch?v=eDfMDkgheQY&ab_channel=TakanashiKiaraCh.hololive-EN",
            sourceUrl: "/audio/songs/talent/talent-hinotori.mp3",
            coverUrl: "/images-opt/song-talent-hinotori.webp",
            duration: "03:53",
        },

        {
            title: "ChikuTaku",
            info: "Obtained in the Ancient Sewer Dungeon",
            originalUrl: "",
            sourceUrl: "/audio/songs/talent/talent-chikutaku.mp3",
            coverUrl: "/images-opt/song-talent-chikutaku.webp",
            duration: "04:01",
        },
        {
            title: "Caesura of Despair",
            info: "Obtained in Star Site: Elpis",
            originalUrl:
                "https://www.youtube.com/watch?v=vBNI979XyoE&list=PLHpKMrPjc0TA-T7DJgK3bcehfrm3b_jJ2&index=1&ab_channel=IRyS-Topic",
            sourceUrl: "/audio/songs/talent/talent-caesura.mp3",
            coverUrl: "/images-opt/song-talent-caesura.webp",
            duration: "04:28",
        },

        {
            title: "Daydream",
            info: "Obtained in Star Site: Chronos",
            originalUrl:
                "https://www.youtube.com/watch?v=6W749jRBg-4&ab_channel=OuroKroniiCh.hololive-EN",
            sourceUrl: "/audio/songs/talent/talent-daydream.mp3",
            coverUrl: "/images-opt/song-talent-daydream.webp",
            duration: "04:16",
        },
        {
            title: "PLAY DICE",
            info: "Obtained in Star Site: Chaos",
            originalUrl: "",
            sourceUrl: "/audio/songs/talent/talent-play-dice.mp3",
            coverUrl: "/images-opt/song-talent-play-dice.webp",
            duration: "03:43",
        },
    ],
    special: [
        {
            title: "Oh Princess",
            info: "Cecilia's song for Iphania",
            originalUrl:
                "https://www.youtube.com/watch?v=5x9ix5CGmoo&ab_channel=CeciliaImmergreenCh.hololive-EN",
            sourceUrl: "/audio/songs/special/special-oh-princess.mp3",
            coverUrl: "/images-opt/song-chapter-2.webp",
            duration: "04:16",
        },
        {
            title: "potato salad",
            info: "potato salad",
            originalUrl:
                "https://www.youtube.com/watch?v=Vf2j3YNF3e8&ab_channel=Mithra%7C%C2%B7%D0%94%C2%B7%29%E3%83%8E",
            sourceUrl: "/audio/songs/special/special-potato-salad.mp3",
            coverUrl: "/images-opt/song-chapter-1.webp",
            duration: "03:43",
        },
    ],
};
