import type { Talent, TrackerData } from "./types";
import { CHARACTER_ID_NAME_MAP_EN, CHARACTER_ID_NAME_MAP_JA } from "@/lib/misc";
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
    name: { en: CHARACTER_ID_NAME_MAP_EN.calli, ja: CHARACTER_ID_NAME_MAP_JA.calli },
    initials: "MC",
    color: "#E24B4A",
    image: "/images-opt/node-calli-opt.webp",
  },
  {
    id: "kiara",
    name: { en: CHARACTER_ID_NAME_MAP_EN.kiara, ja: CHARACTER_ID_NAME_MAP_JA.kiara },
    initials: "TK",
    color: "#EF9F27",
    image: "/images-opt/node-kiara-opt.webp",
  },
  {
    id: "ina",
    name: { en: CHARACTER_ID_NAME_MAP_EN.ina, ja: CHARACTER_ID_NAME_MAP_JA.ina },
    initials: "NI",
    color: "#7F77DD",
    image: "/images-opt/node-ina-opt.webp",
  },
  {
    id: "gura",
    name: { en: CHARACTER_ID_NAME_MAP_EN.gura, ja: CHARACTER_ID_NAME_MAP_JA.gura },
    initials: "GG",
    color: "#378ADD",
    image: "/images-opt/node-gura-opt.webp",
  },
  {
    id: "ame",
    name: { en: CHARACTER_ID_NAME_MAP_EN.ame, ja: CHARACTER_ID_NAME_MAP_JA.ame },
    initials: "WA",
    color: "#FAC775",
    image: "/images-opt/node-ame-opt.webp",
  },
  {
    id: "irys",
    name: { en: CHARACTER_ID_NAME_MAP_EN.irys, ja: CHARACTER_ID_NAME_MAP_JA.irys },
    initials: "IR",
    color: "#D4537E",
    image: "/images-opt/node-irys-opt.webp",
  },
  {
    id: "fauna",
    name: { en: CHARACTER_ID_NAME_MAP_EN.fauna, ja: CHARACTER_ID_NAME_MAP_JA.fauna },
    initials: "CF",
    color: "#639922",
    image: "/images-opt/node-fauna-opt.webp",
  },
  {
    id: "kronii",
    name: { en: CHARACTER_ID_NAME_MAP_EN.kronii, ja: CHARACTER_ID_NAME_MAP_JA.kronii },
    initials: "OK",
    color: "#185FA5",
    image: "/images-opt/node-kronii-opt.webp",
  },
  {
    id: "mumei",
    name: { en: CHARACTER_ID_NAME_MAP_EN.moom, ja: CHARACTER_ID_NAME_MAP_JA.moom },
    initials: "NM",
    color: "#BA7517",
    image: "/images-opt/node-mumei-opt.webp",
  },
  {
    id: "bae",
    name: { en: CHARACTER_ID_NAME_MAP_EN.bae, ja: CHARACTER_ID_NAME_MAP_JA.bae },
    initials: "HB",
    color: "#A32D2D",
    image: "/images-opt/node-bae-opt.webp",
  },
  {
    id: "shiori",
    name: { en: CHARACTER_ID_NAME_MAP_EN.shiori, ja: CHARACTER_ID_NAME_MAP_JA.shiori },
    initials: "SN",
    color: "#9FE1CB",
    image: "/images-opt/node-shiori-opt.webp",
  },
  {
    id: "bijou",
    name: { en: CHARACTER_ID_NAME_MAP_EN.bijou, ja: CHARACTER_ID_NAME_MAP_JA.bijou },
    initials: "KB",
    color: "#5DCAA5",
    image: "/images-opt/node-bijou-opt.webp",
  },
  {
    id: "nerissa",
    name: { en: CHARACTER_ID_NAME_MAP_EN.nerissa, ja: CHARACTER_ID_NAME_MAP_JA.nerissa },
    initials: "NR",
    color: "#CBA8F0",
    image: "/images-opt/node-nerissa-opt.webp",
  },
  {
    id: "fuwawa",
    name: { en: CHARACTER_ID_NAME_MAP_EN.fuwawa, ja: CHARACTER_ID_NAME_MAP_JA.fuwawa },
    initials: "FW",
    color: "#F4C0D1",
    image: "/images-opt/node-fuwawa-opt.webp",
  },
  {
    id: "mococo",
    name: { en: CHARACTER_ID_NAME_MAP_EN.mococo, ja: CHARACTER_ID_NAME_MAP_JA.mococo },
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