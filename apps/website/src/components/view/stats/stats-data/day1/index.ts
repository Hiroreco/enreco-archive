import type { DayData } from "../../types";
import { pizzaChoice } from "./pizza";
import { petChoice } from "./pet";
import { opinionRestChoice } from "./opinion_rest";
import { BASE_TEAMS } from "../base-teams";
import { BASE_CONTINUOUS } from "../base-continuous";

export const day1Data: DayData = {
    teams: BASE_TEAMS,
    continuous: BASE_CONTINUOUS,
    choices: [pizzaChoice, petChoice, opinionRestChoice],
};
