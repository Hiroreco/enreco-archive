import { CommonItemData } from "../src/lib/type";

export interface ValidationResult {
    valid: CommonItemData[];
    invalid: Record<string, string[]>;
}

/**
 * A single check takes an item and returns either:
 *  - null   → passes
 *  - string → error message
 */
type CheckFn = (
    item: CommonItemData,
    currentChapterMax: number,
) => string | null;

/**
 * Define all your checks here.
 * To add more rules, just append another entry.
 */
const checks: Record<string, CheckFn> = {
    chapter: (item, max) => {
        if (item.chapter == null) return "chapter is null";
        if (isNaN(item.chapter)) return "chapter is not a number";
        if (item.chapter < 0) return "chapter is negative";
        if (item.chapter > max)
            return `chapter (${item.chapter}) > max (${max})`;
        return null;
    },
    quote: (item) => (item.quote?.trim() ? null : "quote is empty"),
    name: (item) => (item.name?.trim() ? null : "name is empty"),
    content: (item) => (item.content?.trim() ? null : "content is empty"),
};

export function validateGlossary(
    items: CommonItemData[],
    currentChapterMax: number,
): ValidationResult {
    const valid: CommonItemData[] = [];
    const invalid: Record<string, string[]> = {};

    items.forEach((item) => {
        const errors = Object.entries(checks)
            .map(([, fn]) => fn(item, currentChapterMax))
            .filter((msg): msg is string => !!msg);

        if (errors.length) {
            invalid[item.id] = errors;
        } else {
            valid.push(item);
        }
    });

    return { valid, invalid };
}
