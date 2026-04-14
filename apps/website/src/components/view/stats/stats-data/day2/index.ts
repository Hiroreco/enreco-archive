import type { DayData } from "../../types";
import { jobChoice } from "./job";
import { favoriteFood } from "./favorite_food";
import { weaponChoice } from "./weapon";
import { justiceChoice } from "./justice";
import { fearChoice } from "./fear";

const teams = [
  { name: { en: "Team A", ja: "チームA" }, members: ["calli", "gura", "fauna", "shiori", "nerissa"] },
  { name: { en: "Team B", ja: "チームB" }, members: ["kiara", "ame", "fuwawa", "mococo",] },
  { name: { en: "Team C", ja: "チームC" }, members: ["ina", "irys", "mumei", ] },
  { name: { en: "Team D", ja: "チームD" }, members: ["bae",  "kronii", "bijou"] },
];

export const day2Data: DayData = {
  teams,
  continuous: [jobChoice, favoriteFood],
  choices: [weaponChoice, justiceChoice, fearChoice],
};
