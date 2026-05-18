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
    color: "#E24B4A",
    image: "/images-opt/node-calli-opt.webp",
  },
  {
    id: "kiara",
    name: { en: CHARACTER_ID_NAME_MAP_EN.kiara, ja: CHARACTER_ID_NAME_MAP_JA.kiara },
    color: "#FF914D",
    image: "/images-opt/node-kiara-opt.webp",
  },
  {
    id: "ina",
    name: { en: CHARACTER_ID_NAME_MAP_EN.ina, ja: CHARACTER_ID_NAME_MAP_JA.ina },
    color: "#8880cd",
    image: "/images-opt/node-ina-opt.webp",
  },
  {
    id: "gura",
    name: { en: CHARACTER_ID_NAME_MAP_EN.gura, ja: CHARACTER_ID_NAME_MAP_JA.gura },
    color: "#5BBFEA",
    image: "/images-opt/node-gura-opt.webp",
  },
  {
    id: "ame",
    name: { en: CHARACTER_ID_NAME_MAP_EN.ame, ja: CHARACTER_ID_NAME_MAP_JA.ame },
    color: "#FFF0A5",
    image: "/images-opt/node-ame-opt.webp",
  },
  {
    id: "irys",
    name: { en: CHARACTER_ID_NAME_MAP_EN.irys, ja: CHARACTER_ID_NAME_MAP_JA.irys },
    color: "#B2006A",
    image: "/images-opt/node-irys-opt.webp",
  },
  {
    id: "fauna",
    name: { en: CHARACTER_ID_NAME_MAP_EN.fauna, ja: CHARACTER_ID_NAME_MAP_JA.fauna },
    color: "#9DF699",
    image: "/images-opt/node-fauna-opt.webp",
  },
  {
    id: "kronii",
    name: { en: CHARACTER_ID_NAME_MAP_EN.kronii, ja: CHARACTER_ID_NAME_MAP_JA.kronii },
    color: "#6e8893",
    image: "/images-opt/node-kronii-opt.webp",
  },
  {
    id: "mumei",
    name: { en: CHARACTER_ID_NAME_MAP_EN.moom, ja: CHARACTER_ID_NAME_MAP_JA.moom },
    color: "#D4AF37",
    image: "/images-opt/node-mumei-opt.webp",
  },
  {
    id: "bae",
    name: { en: CHARACTER_ID_NAME_MAP_EN.bae, ja: CHARACTER_ID_NAME_MAP_JA.bae },
    color: "#FF0000",
    image: "/images-opt/node-bae-opt.webp",
  },
  {
    id: "shiori",
    name: { en: CHARACTER_ID_NAME_MAP_EN.shiori, ja: CHARACTER_ID_NAME_MAP_JA.shiori },
    color: "#A084E8",
    image: "/images-opt/node-shiori-opt.webp",
  },
  {
    id: "bijou",
    name: { en: CHARACTER_ID_NAME_MAP_EN.bijou, ja: CHARACTER_ID_NAME_MAP_JA.bijou },
    color: "#7286D3",
    image: "/images-opt/node-bijou-opt.webp",
  },
  {
    id: "nerissa",
    name: { en: CHARACTER_ID_NAME_MAP_EN.nerissa, ja: CHARACTER_ID_NAME_MAP_JA.nerissa },
    color: "#616cd8",
    image: "/images-opt/node-nerissa-opt.webp",
  },
  {
    id: "fuwawa",
    name: { en: CHARACTER_ID_NAME_MAP_EN.fuwawa, ja: CHARACTER_ID_NAME_MAP_JA.fuwawa },
    color: "#7ea9dc",
    image: "/images-opt/node-fuwawa-opt.webp",
  },
  {
    id: "mococo",
    name: { en: CHARACTER_ID_NAME_MAP_EN.mococo, ja: CHARACTER_ID_NAME_MAP_JA.mococo },
    color: "#e59cc7",
    image: "/images-opt/node-mococo-opt.webp",
  },
  {
    id: "liz",
    name: { en: CHARACTER_ID_NAME_MAP_EN.liz, ja: CHARACTER_ID_NAME_MAP_JA.liz },
    color: "#C70039",
    image: "/images-opt/node-liz-opt.webp",
  },
  {
    id: "cecilia",
    name: { en: CHARACTER_ID_NAME_MAP_EN.cecilia, ja: CHARACTER_ID_NAME_MAP_JA.cecilia },
    color: "#159758",
    image: "/images-opt/node-cecilia-opt.webp",
  },
  {
    id: "gigi",
    name: { en: CHARACTER_ID_NAME_MAP_EN.gigi, ja: CHARACTER_ID_NAME_MAP_JA.gigi },
    color: "#ea8d36",
    image: "/images-opt/node-gigi-opt.webp",
  },
  {
    id: "raora",
    name: { en: CHARACTER_ID_NAME_MAP_EN.raora, ja: CHARACTER_ID_NAME_MAP_JA.raora },
    color: "#E8A7A1",
    image: "/images-opt/node-raora-opt.webp",
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