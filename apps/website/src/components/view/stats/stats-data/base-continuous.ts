import type { ContinuousChoice } from "../types";
import { jobChoice } from "./day1/job";
import { favoriteFood } from "./day1/favorite_food";

export const BASE_CONTINUOUS: ContinuousChoice[] = [jobChoice, favoriteFood];

export function overrideContinuous(
  overrides?: Partial<Record<string, Record<number, Partial<{ members: string[] }>>>>,
): ContinuousChoice[] {
  if (!overrides) return BASE_CONTINUOUS;
  
  return BASE_CONTINUOUS.map((choice) => {
    const choiceOverride = overrides[choice.id];
    if (!choiceOverride) return choice;
    
    return {
      ...choice,
      options: choice.options.map((option, idx) => ({
        ...option,
        ...(choiceOverride[idx] || {}),
      })),
    };
  });
}

// Export day1 base versions for reference
export { jobChoice, favoriteFood };
