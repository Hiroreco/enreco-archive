import ViewTextModal from "@/components/view/utility-modals/ViewTextModal";
import { ImageNodeType } from "@enreco-archive/common/types";
import React from "react";

interface JournalUtilityProps {
    chapter: number;
    day: number;
    id: string;
}

const JournalUtility = ({ chapter, day, id }: JournalUtilityProps) => {
    const journalId = `${id}-journal-c${chapter + 1}d${day + 1}`;
    return <ViewTextModal textId={journalId} label="" />;
};

const UTILITY_CONFIG = {
    journal: {
        chapters: [1],
        component: JournalUtility,
    },
};

interface ViewCardUtilitiesProps {
    chapter: number;
    node: ImageNodeType | null;
}

const ViewCardUtilities = ({ chapter, node }: ViewCardUtilitiesProps) => {
    if (!node) {
        return null;
    }
    const day = node?.data.day;
    const id = node?.id;

    return (
        <div className="flex gap-2 items-center mr-2">
            {Object.entries(UTILITY_CONFIG).map(([key, config]) => {
                if (config.chapters.includes(chapter)) {
                    const UtilityComponent = config.component;
                    return (
                        <UtilityComponent
                            key={key}
                            chapter={chapter}
                            day={day}
                            id={id}
                        />
                    );
                }
                return null;
            })}
        </div>
    );
};

export default ViewCardUtilities;
