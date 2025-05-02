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
        role: "Archiver",
        icon: <Book size={iconSize} />,
        contributors: [
            {
                name: "Hiro",
                socials: "https://x.com/hiroavrs",
            },
            {
                name: "Zephyr Kitten",
                socials: null,
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
                socials:
                    "https://x.com/knightalfy?s=21&t=BK74P_JoXiHZQYXSh_0W-A",
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
                socials: null,
            },
            {
                name: "A1on",
                socials: null,
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
];
