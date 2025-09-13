import { lint as lintSync } from "markdownlint/sync";
/**
 * One check returns either null (passes)
 * or an error message (fails).
 */
export type RecapCheckFn = (content: string) => string | null;

/**
 * Whitelisted "hash‐tags" that are allowed in links.
 * E.g. in `[foo](#embed:... )` the tag is "embed".
 */
const VALID_TAGS = new Set([
    "embed",
    "edge",
    "node",
    "easter",
    "text",
    "entry",
    "out",
]);

/**
 * Comprehensive markdown syntax validation using markdownlint
 */
const validateMarkdownSyntax = (content: string): string[] => {
    const options = {
        strings: { content }, // Note: key name is the identifier
        config: {
            // Disable rules that might conflict with custom syntax
            MD013: false, // Line length
            MD033: false, // HTML elements (you might use custom tags)
            MD041: false, // First line in file should be a top level header
            MD004: false, // Unordered list style

            MD037: false, // Spaces inside emphasis markers,
            MD038: false, // Spaces inside code span elements
            MD040: false, // Fenced code blocks should have a language specified
            MD047: false, // Files should end with a single newline character
            MD050: false, // Code block style
            MD051: false, // Link reference definitions should be consecutive
            MD009: {
                // Trailing spaces
                br_spaces: 2,
            },
            MD012: {
                // Multiple consecutive blank lines
                maximum: 2,
            },
            MD019: false, // Multiple spaces after hash on atx style header
            MD023: false, // Headers must start at the beginning of the line
            MD027: false, // Multiple spaces after blockquote symbol
            MD030: false, // Spaces after list markers,
            MD018: false, // No missing space after atx header
            MD036: false, // No emphasis as heading
            MD049: false, // Emphasis style consistency
            MD058: false, // Blank round tables
            MD045: false, // Images should have alt text
            MD028: false, // Blank lines inside blockquote
        },
    };

    try {
        const result = lintSync(options);
        // The result has the content key we used in strings
        return (result.content || []).map((err: any) =>
            err.ruleNames
                ? `${err.ruleNames.join(", ")}: ${err.errorDetail || err.errorContext || err.errorMessage}`
                : String(err),
        );
    } catch (error: any) {
        return [`Markdown validation error: ${error.message}`];
    }
};

export const recapChecks: Record<string, RecapCheckFn> = {
    linkSyntax: (content) => {
        // (?<!\!) ensures we don't match ![alt](src)
        const RE = /(?<!!)\[([^\]]*)\]\(([^)]*)\)/g;
        let m: RegExpExecArray | null;
        while ((m = RE.exec(content))) {
            const [full, label, url] = m;
            if (!label.trim()) return `empty link label in ${full}`;
            if (!url.trim()) return `empty URL in ${full}`;
        }
        return null;
    },

    strayBrackets: (content) => {
        if (/\[[^\]]*$/.test(content) || /^[^[\]]*\]/m.test(content)) {
            return `unbalanced or stray square bracket`;
        }
        return null;
    },

    /**
     * NEW: any link whose URL starts with "#" must use a whitelisted tag
     * Syntax: [label](#tag:some-identifier)
     */
    tagWhitelist: (content) => {
        const RE = /\[([^\]]+)\]\(#[^)]*\)/g;
        let m: RegExpExecArray | null;
        while ((m = RE.exec(content))) {
            const full = m[0]; // e.g. "[foo](#xyz:123)"
            const url = full.match(/\((#[^)]*)\)/)![1]; // "#xyz:123"
            const [hashTag] = url.slice(1).split(":", 1); // "xyz"
            if (!VALID_TAGS.has(hashTag)) {
                return `unknown #‑tag "${hashTag}" in ${full}`;
            }
        }
        return null;
    },

    /**
     * Comprehensive markdown syntax validation
     * Replaces individual bold, italic, strikethrough, code block checks
     */
    markdownSyntax: (content) => {
        const errors = validateMarkdownSyntax(content);
        if (errors.length > 0) {
            // Return the first error, or combine multiple errors
            return errors.join("; ");
        }
        return null;
    },
};

/**
 * Run all recapChecks on a piece of content,
 * returning an array of error messages (empty = all good).
 */
export function validateRecapContent(content: string): string[] {
    return Object.entries(recapChecks)
        .map(([, fn]) => fn(content))
        .filter((msg): msg is string => !!msg);
}
