import LineSvg from "@/components/view/chart/LineSvg";
import { Checkbox } from "@enreco-archive/common-ui/components/checkbox";
import { Label } from "@enreco-archive/common-ui/components/label";
import {
    Chapter,
    ImageNodeType,
    StringToBooleanObjectMap,
} from "@enreco-archive/common/types";
import { extractImageSrcFromNodes } from "@/lib/utils";
import { useMemo } from "react";
import Image from "next/image";

interface Props {
    relationshipVisibility: StringToBooleanObjectMap;
    toggleRelationshipVisible: (
        relationshipId: string,
        relationshipVisibility: boolean,
    ) => void;
    toggleAllRelationshipVisible: (relationshipVisibility: boolean) => void;
    showOnlyNewEdges: boolean;
    setShowOnlyNewEdges: (newVal: boolean) => void;
    teamVisibility: StringToBooleanObjectMap;
    toggleTeamVisible: (teamId: string, visibility: boolean) => void;
    toggleAllTeamsVisible: (visibility: boolean) => void;
    characterVisibility: { [key: string]: boolean };
    toggleCharacterVisible: (characterId: string, visibility: boolean) => void;
    toggleAllCharactersVisible: (visibility: boolean) => void;
    chapter: number;
    chapterData: Chapter;
    nodes: ImageNodeType[];
}

const ViewVisibilityCard = ({
    relationshipVisibility,
    toggleRelationshipVisible,
    toggleAllRelationshipVisible,
    showOnlyNewEdges,
    setShowOnlyNewEdges,
    teamVisibility,
    toggleTeamVisible,
    toggleAllTeamsVisible,
    characterVisibility,
    toggleCharacterVisible,
    toggleAllCharactersVisible,
    chapter,
    chapterData,
    nodes,
}: Props) => {
    // Extract image src from nodes
    const characterImagesMap = useMemo(() => {
        const charImgMap = extractImageSrcFromNodes(nodes);
        return charImgMap;
    }, [nodes]);

    return (
        <div className="flex flex-col gap-4 p-4 h-full overflow-y-scroll">
            <span className="font-bold text-xl">Visibility Toggles</span>
            <div className="grid md:grid-cols-2 gap-4">
                {/* Edges */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <span className="font-bold">Relationship Toggles</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <Label htmlFor="edge-new">
                            Show updated edges only
                        </Label>
                        <Checkbox
                            id="edge-new"
                            checked={showOnlyNewEdges}
                            onCheckedChange={setShowOnlyNewEdges}
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <Label htmlFor="edge-all">
                            <span className="">Show all edges</span>
                        </Label>

                        <Checkbox
                            id="edge-all"
                            checked={Object.keys(relationshipVisibility).every(
                                (key) => relationshipVisibility[key] === true,
                            )}
                            onCheckedChange={(checked) => {
                                if (checked === "indeterminate") {
                                    toggleAllRelationshipVisible(false);
                                } else {
                                    toggleAllRelationshipVisible(checked);
                                }
                            }}
                        />
                    </div>
                    {Object.keys(chapterData.relationships).map((key) => (
                        <div
                            className="flex justify-between w-full items-center gap-10"
                            key={key}
                        >
                            <Label htmlFor={`edge-${key.toLowerCase()}`}>
                                <div className="flex gap-2 items-center">
                                    <LineSvg
                                        style={
                                            chapterData.relationships[key].style
                                        }
                                    />
                                    <span className="capitalize">
                                        {chapterData.relationships[key].name ||
                                            key}
                                    </span>
                                </div>
                            </Label>

                            <Checkbox
                                id={`edge-${key.toLowerCase()}`}
                                checked={relationshipVisibility[key]}
                                onCheckedChange={(checked) => {
                                    if (checked === "indeterminate") {
                                        toggleRelationshipVisible(key, false);
                                    } else {
                                        toggleRelationshipVisible(key, checked);
                                    }
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Teams */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <span className="font-bold">
                            {chapter === 0
                                ? "Guild Toggles"
                                : chapter === 1
                                  ? "Job Toggles"
                                  : "Team Toggles"}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <Label htmlFor="team-all">
                            <span>
                                {chapter === 0
                                    ? "Show all guilds"
                                    : chapter === 1
                                      ? "Show all jobs"
                                      : "Show all teams"}
                            </span>
                        </Label>

                        <Checkbox
                            id="team-all"
                            checked={Object.values(teamVisibility).every(
                                (v) => v === true,
                            )}
                            onCheckedChange={(checked) => {
                                if (checked === "indeterminate") {
                                    toggleAllTeamsVisible(false);
                                } else {
                                    toggleAllTeamsVisible(checked);
                                }
                            }}
                        />
                    </div>
                    {Object.keys(chapterData.teams).map((key) => (
                        <div
                            className="flex justify-between w-full items-center gap-10"
                            key={key}
                        >
                            <Label htmlFor={`team-${key.toLowerCase()}`}>
                                <div className="flex gap-2 items-center">
                                    <Image
                                        src={chapterData.teams[key].teamIconSrc}
                                        className="w-8 h-8"
                                        alt={`${key} logo`}
                                        width={32}
                                        height={32}
                                    />
                                    <span className="capitalize">
                                        {chapterData.teams[key].name || key}
                                    </span>
                                </div>
                            </Label>

                            <Checkbox
                                id={`team-${key.toLowerCase()}`}
                                checked={teamVisibility[key]}
                                onCheckedChange={(checked) => {
                                    if (checked === "indeterminate") {
                                        toggleTeamVisible(key, false);
                                    } else {
                                        toggleTeamVisible(key, checked);
                                    }
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
            {/* Characters */}
            <div className="flex justify-between items-center">
                <span className="font-bold">Character Toggles</span>
            </div>
            <div className="grid md:grid-rows-10 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center">
                    <Label htmlFor="character-all">
                        <span>Show all characters</span>
                    </Label>

                    <Checkbox
                        id="character-all"
                        checked={Object.values(characterVisibility).every(
                            (v) => v,
                        )}
                        onCheckedChange={(checked) => {
                            if (checked === "indeterminate") {
                                toggleAllCharactersVisible(false);
                            } else {
                                toggleAllCharactersVisible(checked);
                            }
                        }}
                    />
                </div>
                <div>
                    {/* This is a blank element used as a filler for row 1, column 2. */}
                </div>
                {Object.keys(characterVisibility).map((key) => (
                    <div
                        className="flex justify-between w-full items-center gap-10"
                        key={key}
                    >
                        <Label htmlFor={`character-${key.toLowerCase()}`}>
                            <div className="flex gap-2 items-center">
                                <Image
                                    src={characterImagesMap[key]}
                                    className="w-8 h-8"
                                    alt={`${key} logo`}
                                    width={32}
                                    height={32}
                                />
                                <span className="capitalize">
                                    {nodes.find((node) => node.id === key)?.data
                                        .title || key}
                                </span>
                            </div>
                        </Label>

                        <Checkbox
                            id={`character-${key.toLowerCase()}`}
                            checked={characterVisibility[key]}
                            onCheckedChange={(checked) => {
                                if (checked === "indeterminate") {
                                    toggleCharacterVisible(key, false);
                                } else {
                                    toggleCharacterVisible(key, checked);
                                }
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ViewVisibilityCard;
