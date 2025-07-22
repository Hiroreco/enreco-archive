export interface MarkdownSection {
    id: string;
    title: string;
    level: number; // 2, 3, or 4 for h2, h3, h4
}

export function generateSectionId(title: string, index: number): string {
    // Create base ID from title
    const baseId = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special chars except spaces and hyphens
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/--+/g, "-") // Replace multiple hyphens with single
        .trim();

    // Make ID unique by adding the index
    return `${baseId}-${index}`;
}

export function extractMarkdownSections(
    content: string,
    levels: number[] = [2, 3, 4],
): MarkdownSection[] {
    if (!content) return [];

    // Always extract h2, h3, h4 headings to maintain consistent indexing
    const regex = /^(#{2,4})\s+(.+)$/gm;
    const matches = [...content.matchAll(regex)];

    const allSections = matches.map((match, index) => {
        const level = match[1].length; // Number of # characters
        const title = match[2].trim();
        const uniqueId = generateSectionId(title, index);

        return {
            id: uniqueId,
            title,
            level,
        };
    });

    // Filter to only return sections matching the requested levels
    return allSections.filter((section) => levels.includes(section.level));
}
