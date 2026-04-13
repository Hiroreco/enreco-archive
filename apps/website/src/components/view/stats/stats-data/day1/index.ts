import type { DayData } from "../../types";
import { jobChoice } from "./job";
import { favoriteFood } from "./favorite_food";
import { pizzaChoice } from "./pizza";
import { petChoice } from "./pet";
import { opinionRestChoice } from "./opinion_rest";

const teams = [
  { name: { en: "Team A", ja: "チームA" }, members: ["calli", "gura", "fauna", "shiori"] },
  { name: { en: "Team B", ja: "チームB" }, members: ["kiara", "ame", "kronii", "bijou"] },
  { name: { en: "Team C", ja: "チームC" }, members: ["ina", "irys", "mumei", "nerissa"] },
  { name: { en: "Team D", ja: "チームD" }, members: ["bae", "fuwawa", "mococo"] },
];

export const day1Data: DayData = {
  teams,
  continuous: [jobChoice, favoriteFood],
  choices: [pizzaChoice, petChoice, opinionRestChoice],
};
