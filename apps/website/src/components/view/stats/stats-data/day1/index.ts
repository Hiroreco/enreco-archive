import type { DayData } from "../../types";
import { BASE_CONTINUOUS } from "../base-continuous";
import { opinionRestChoice } from "./opinion_rest";
import { petChoice } from "./pet";
import { pizzaChoice } from "./pizza";

export const day1Data: DayData = {
    continuous: BASE_CONTINUOUS,
    choices: [pizzaChoice, petChoice, opinionRestChoice],
};
