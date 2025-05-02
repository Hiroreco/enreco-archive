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
                socials: "https://x.com/ZephyrKitten",
            },
            {
                name: "Rieght",
                socials: null,
            },
            {
                name: "Fayelinya Luna",
                socials: null,
            },
            {
                name: "Alfy",
                socials: null,
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
