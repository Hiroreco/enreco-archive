import { betrayFamilyChoice } from "@/components/view/stats/stats-data/day4/betray-family";
import { throwAwayPossessionsChoice } from "@/components/view/stats/stats-data/day4/throw-away";
import { declareUndyingLoveChoice } from "@/components/view/stats/stats-data/day4/undying-love";
import { whoToTalkToChoice } from "@/components/view/stats/stats-data/day4/vega-prisoner";
import { DayData } from "@/components/view/stats/types";

export const day4Data: DayData = {
    teams: [],
    continuous: [],
    choices: [
        throwAwayPossessionsChoice,
        declareUndyingLoveChoice,
        betrayFamilyChoice,
        whoToTalkToChoice,
    ],
};
