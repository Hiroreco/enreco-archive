export interface FanficChapter {
    number: number;
    title: string;
    summary: string;
    storyKey: string;
}

export interface FanficEntry {
    author: string;
    title: string;
    characters: string[];
    tags: string[];
    summary: string;
    src: string;
    chapters: FanficChapter[];
    totalChapters: number;
}
