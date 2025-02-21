import { Monitor, Palette, Pencil } from "lucide-react";

const iconSize = 20;

export const CONTRIBUTORS = [
    {
        role: "Organizer & Writer",
        icon: <Pencil size={iconSize} />,
        contributors: [
            {
                name: "Hiro",
                socials: "https://twitter.com/hiroavrs",
            },
        ],
    },
    {
        role: "Developer",
        icon: <Monitor size={iconSize} />,
        contributors: [
            {
                name: "Tachtician_Walt",
                socials: "https://x.com/Walt280",
            },
            {
                name: "Hiro",
                socials: "https://twitter.com/hiroavrs",
            },
            {
                name: "goose",
                socials: "https://github.com/Pyreko",
            },
            {
                name: "GoldElysium",
                socials: "",
            },
        ],
    },
    {
        role: "Site Graphics",
        icon: <Palette size={iconSize} />,
        contributors: [
            {
                name: "Quarases",
                socials: "",
            },
            {
                name: "A1on",
                socials: "",
            },
            {
                name: "keenbiscuit",
                socials: "https://x.com/keenbiscuit",
            },
        ],
    },
];
