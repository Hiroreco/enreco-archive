// --- Types ---
export type FontFamily = "sans" | "serif" | "mono";

// --- Maps ---
export const TEXT_SIZE_MAP: Record<string, string> = {
    xs: "0.8rem",
    sm: "0.9rem",
    md: "1rem",
    mdlg: "1.08rem",
    lg: "1.2rem",
    xlg: "1.35rem",
};

export const FONT_FAMILY_MAP: Record<FontFamily, string> = {
    sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
};

// --- Helpers ---

export function getTextSizeClass(textSize: string): string {
    switch (textSize) {
        case "sm":
            return "text-sm";
        case "lg":
            return "text-lg";
        default:
            return "text-base";
    }
}

export function getTextSizeValue(textSize: string): string {
    return TEXT_SIZE_MAP[textSize] || TEXT_SIZE_MAP.md;
}

export function getFontFamilyValue(fontFamily: FontFamily): string {
    return FONT_FAMILY_MAP[fontFamily] || 'inherit';
}
