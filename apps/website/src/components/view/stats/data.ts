import type { Talent, TrackerData } from "./types";
import { day1Data } from "./stats-data/day1";
import { day2Data } from "./stats-data/day2";
import { day3Data } from "./stats-data/day3";
import { day4Data } from "./stats-data/day4";
import { day5Data } from "./stats-data/day5";
import { day6Data } from "./stats-data/day6";
import { day7Data } from "./stats-data/day7";
import { day8Data } from "./stats-data/day8";

export const TALENTS: Talent[] = [
  {
    id: "calli",
    name: "Mori Calliope",
    initials: "MC",
    color: "#E24B4A",
    image: "/images-opt/node-calli-opt.webp",
  },
  {
    id: "kiara",
    name: "Takanashi Kiara",
    initials: "TK",
    color: "#EF9F27",
    image: "/images-opt/node-kiara-opt.webp",
  },
  {
    id: "ina",
    name: "Ninomae Ina'nis",
    initials: "NI",
    color: "#7F77DD",
    image: "/images-opt/node-ina-opt.webp",
  },
  {
    id: "gura",
    name: "Gawr Gura",
    initials: "GG",
    color: "#378ADD",
    image: "/images-opt/node-gura-opt.webp",
  },
  {
    id: "ame",
    name: "Watson Amelia",
    initials: "WA",
    color: "#FAC775",
    image: "/images-opt/node-ame-opt.webp",
  },
  {
    id: "irys",
    name: "IRyS",
    initials: "IR",
    color: "#D4537E",
    image: "/images-opt/node-irys-opt.webp",
  },
  {
    id: "fauna",
    name: "Ceres Fauna",
    initials: "CF",
    color: "#639922",
    image: "/images-opt/node-fauna-opt.webp",
  },
  {
    id: "kronii",
    name: "Ouro Kronii",
    initials: "OK",
    color: "#185FA5",
    image: "/images-opt/node-kronii-opt.webp",
  },
  {
    id: "mumei",
    name: "Nanashi Mumei",
    initials: "NM",
    color: "#BA7517",
    image: "/images-opt/node-mumei-opt.webp",
  },
  {
    id: "bae",
    name: "Hakos Baelz",
    initials: "HB",
    color: "#A32D2D",
    image: "/images-opt/node-bae-opt.webp",
  },
  {
    id: "shiori",
    name: "Shiori Novella",
    initials: "SN",
    color: "#9FE1CB",
    image: "/images-opt/node-shiori-opt.webp",
  },
  {
    id: "bijou",
    name: "Koseki Bijou",
    initials: "KB",
    color: "#5DCAA5",
    image: "/images-opt/node-bijou-opt.webp",
  },
  {
    id: "nerissa",
    name: "Nerissa Ravencroft",
    initials: "NR",
    color: "#CBA8F0",
    image: "/images-opt/node-nerissa-opt.webp",
  },
  {
    id: "fuwawa",
    name: "Fuwawa Abyssgard",
    initials: "FW",
    color: "#F4C0D1",
    image: "/images-opt/node-fuwawa-opt.webp",
  },
  {
    id: "mococo",
    name: "Mococo Abyssgard",
    initials: "MC2",
    color: "#F0997B",
    image: "/images-opt/node-mococo-opt.webp",
  },
];

export const talentById = (id: string): Talent | undefined =>
  TALENTS.find((t) => t.id === id);

export const TRACKER_DATA: TrackerData = {
  1: day1Data,
  2: day2Data,
  3: day3Data,
  4: day4Data,
  5: day5Data,
  6: day6Data,
  7: day7Data,
  8: day8Data,
};

export const TOTAL_DAYS = 8;