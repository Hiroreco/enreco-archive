/**
 * Utility functions for handling LocalizedString and string values
 */

import { LocalizedString } from "@enreco-archive/common/types";

export function isLocalizedString(value: any): value is LocalizedString {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof value.en === "string" &&
        typeof value.ja === "string"
    );
}

export function getEnglishString(value: string | LocalizedString): string {
    if (isLocalizedString(value)) {
        return value.en;
    }
    return value;
}

export function getJapaneseString(value: string | LocalizedString): string {
    if (isLocalizedString(value)) {
        return value.ja;
    }
    return value;
}

/**
 * Returns a LocalizedString, converting from string if needed
 */
export function ensureLocalizedString(
    value: string | LocalizedString,
): LocalizedString {
    if (isLocalizedString(value)) {
        return value;
    }
    // If it's a plain string, return it with both en and ja set to the same value
    return { en: value, ja: value };
}
