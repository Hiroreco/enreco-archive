/**
 * One check returns either null (passes)
 * or an error message (fails).
 */
export type RecapCheckFn = (content: string) => string | null;

/**
 * Whitelisted “hash‐tags” that are allowed in links.
 * E.g. in `[foo](#embed:... )` the tag is “embed”.
 */
const VALID_TAGS = new Set(["embed", "edge", "node"]);

export const recapChecks: Record<string, RecapCheckFn> = {
    linkSyntax: (content) => {
        const RE = /\[([^\]]*)\]\(([^)]*)\)/g;
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
                return `unknown #‑tag “${hashTag}” in ${full}`;
            }
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
