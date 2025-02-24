import LineSvg from "@/components/LineSvg";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Chapter, ImageNodeType, StringToBooleanObjectMap } from "@/lib/type";
import { extractImageSrcFromNodes } from "@/lib/utils";
import clsx from "clsx";
import { useMemo } from "react";

interface Props {
    edgeVisibility: StringToBooleanObjectMap;
    onEdgeVisibilityChange: (
        newEdgeVisibility: StringToBooleanObjectMap,
    ) => void;
    teamVisibility: StringToBooleanObjectMap;
    onTeamVisibilityChange: (
        newTeamVisibility: StringToBooleanObjectMap,
    ) => void;
    characterVisibility: { [key: string]: boolean };
    onCharacterVisibilityChange: (
        newCharacterVisibility: StringToBooleanObjectMap,
    ) => void;
    chapterData: Chapter;
    nodes: ImageNodeType[];
    drawerOpenFully?: boolean;
}

const ViewVisibilityCard = ({
    edgeVisibility,
    onEdgeVisibilityChange,
    teamVisibility,
    onTeamVisibilityChange,
    characterVisibility,
    onCharacterVisibilityChange,
    chapterData,
    nodes,
    drawerOpenFully,
}: Props) => {
    // Extract image src from nodes
    const characterImagesMap = useMemo(() => {
        const charImgMap = extractImageSrcFromNodes(nodes);
        return charImgMap;
    }, [nodes]);

    return (
        <div
            className={clsx("flex flex-col gap-4 p-4 h-full", {
                "overflow-y-scroll":
                    drawerOpenFully === true || drawerOpenFully === undefined,
                "overflow-y-hidden": drawerOpenFully === false,
            })}
        >
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
                            checked={edgeVisibility.new}
                            onCheckedChange={(checked) =>
                                onEdgeVisibilityChange({
                                    ...edgeVisibility,
                                    new: checked as boolean,
                                })
                            }
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <Label htmlFor="edge-all">
                            <span className="">Show all edges</span>
                        </Label>

                        <Checkbox
                            id="edge-all"
                            checked={Object.keys(edgeVisibility).every(
                                (key) => {
                                    return key === "new"
                                        ? true
                                        : edgeVisibility[key];
                                },
                            )}
                            onCheckedChange={(checked) => {
                                const newEdgeVisibility = Object.keys(
                                    edgeVisibility,
                                ).reduce(
                                    (acc, key) => {
                                        acc[key] = checked as boolean;
                                        return acc;
                                    },
                                    {} as Record<string, boolean>,
                                );
                                onEdgeVisibilityChange(newEdgeVisibility);
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
                                checked={edgeVisibility[key]}
                                onCheckedChange={(checked) =>
                                    onEdgeVisibilityChange({
                                        ...edgeVisibility,
                                        [key]: checked as boolean,
                                    })
                                }
                            />
                        </div>
                    ))}
                </div>

                {/* Teams */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <span className="font-bold">Team Toggles</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <Label htmlFor="team-all">
                            <span>Show all teams</span>
                        </Label>

                        <Checkbox
                            id="team-all"
                            checked={Object.values(teamVisibility).every(
                                (v) => v,
                            )}
                            onCheckedChange={(checked) => {
                                const newTeamVisibility = Object.keys(
                                    teamVisibility,
                                ).reduce(
                                    (acc, key) => {
                                        acc[key] = checked as boolean;
                                        return acc;
                                    },
                                    {} as Record<string, boolean>,
                                );
                                onTeamVisibilityChange(newTeamVisibility);
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
                                    <img
                                        src={chapterData.teams[key].teamIconSrc}
                                        className="w-8 h-8"
                                        alt={`${key} logo`}
                                    />
                                    <span className="capitalize">
                                        {chapterData.teams[key].name || key}
                                    </span>
                                </div>
                            </Label>

                            <Checkbox
                                id={`team-${key.toLowerCase()}`}
                                checked={teamVisibility[key]}
                                onCheckedChange={(checked) =>
                                    onTeamVisibilityChange({
                                        ...teamVisibility,
                                        [key]: checked as boolean,
                                    })
                                }
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
                            const newCharacterVisibility = Object.keys(
                                characterVisibility,
                            ).reduce(
                                (acc, key) => {
                                    acc[key] = checked as boolean;
                                    return acc;
                                },
                                {} as Record<string, boolean>,
                            );
                            onCharacterVisibilityChange(newCharacterVisibility);
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
                                <img
                                    src={characterImagesMap[key]}
                                    className="w-8 h-8"
                                    alt={`${key} logo`}
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
                            onCheckedChange={(checked) =>
                                onCharacterVisibilityChange({
                                    ...characterVisibility,
                                    [key]: checked as boolean,
                                })
                            }
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ViewVisibilityCard;
