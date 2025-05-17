import EditorCard from "@/components/editor/EditorCard";
import { Button } from "@enreco-archive/common-ui/components/button";
import { Input } from "@enreco-archive/common-ui/components/input";
import { Label } from "@enreco-archive/common-ui/components/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import { DEFAULT_NODE_IMAGE } from "@/lib/constants";
import { EditorImageNodeType, TeamMap } from "@/lib/type";

import MDEditor from "@uiw/react-md-editor";
import { extractColors } from "extract-colors";
import { produce, WritableDraft } from "immer";
import { Copy, LucideX } from "lucide-react";
import { useRef, useState } from "react";
import slug from "slug";

const MAX_ID_LENGTH = 30;

function getUniqueId(newId: string, origId: string, nodeIds: string[]) {
    if (newId === origId) {
        return origId;
    }

    let actualId = newId;
    let counter = 1;
    while (nodeIds.filter((nodeId) => nodeId === actualId).length !== 0) {
        actualId = `${newId}-${counter}`;
        counter++;
    }

    return actualId;
}

interface EditorNodeCardProps {
    isVisible: boolean;
    teams: TeamMap;
    nodes: EditorImageNodeType[];
    selectedNode: EditorImageNodeType;
    updateNode: (
        oldNode: EditorImageNodeType,
        newNode: EditorImageNodeType,
    ) => void;
    deleteNode: () => void;
    onCardClose: () => void;
    numberOfDays: number;
    isDarkMode: boolean;
}

export default function EditorNodeCard({
    isVisible,
    teams,
    nodes,
    selectedNode,
    updateNode,
    deleteNode,
    onCardClose,
    numberOfDays,
    isDarkMode,
}: EditorNodeCardProps) {
    const [workingNode, setWorkingNode] = useState(selectedNode);
    const [imgPreviewLink, setImgPreviewLink] = useState(
        selectedNode.data.imageSrc || DEFAULT_NODE_IMAGE,
    );
    const [extractedColors, setExtractedColors] = useState<string[]>([]);

    const titleElem = useRef<HTMLInputElement>(null);

    const nodeIds = nodes.map((node) => node.id);

    const handleSave = () => {
        updateNode(selectedNode, workingNode);
    };

    const generateIdFromTitle = (title: string) => {
        const truncTitle =
            title.length > MAX_ID_LENGTH
                ? title.substring(0, MAX_ID_LENGTH)
                : title;
        return getUniqueId(slug(truncTitle), selectedNode.id, nodeIds);
    };

    const commitImageSrc = (newImageSrc: string) => {
        setImgPreviewLink(newImageSrc);
        setExtractedColors([]);
    };

    const setWorkingNodeAttr = (
        updater: (draft: WritableDraft<EditorImageNodeType>) => void,
    ) => {
        setWorkingNode(produce(workingNode, updater));
    };

    const extractColorsFromImage = async () => {
        const imgColors = await extractColors(imgPreviewLink);
        imgColors.sort((a, b) => b.area - a.area);
        setExtractedColors(imgColors.slice(0, 5).map((color) => color.hex));
        setWorkingNodeAttr((draft) => {
            draft.data.bgCardColor = imgColors[0].hex;
        });
    };

    const onClose = () => {
        onCardClose();
    };

    if (!isVisible) {
        return;
    }

    return (
        <EditorCard>
            <div className="w-full sticky top-0 bg-background z-10">
                <div className="flex justify-between items-center w-full">
                    <div className="text-xl font-bold">Node Editor</div>
                    <Button onClick={onClose}>
                        <LucideX />
                    </Button>
                </div>
                <Separator className="mt-2" />
            </div>

            <Button
                type="button"
                className="flex flex-row content-center"
                onClick={() => {
                    if (titleElem.current) {
                        setWorkingNodeAttr((draft) => {
                            draft.id = generateIdFromTitle(
                                titleElem.current?.value || "",
                            );
                        });
                    }
                }}
            >
                Generate id from title
            </Button>

            <div className="grid grid-cols-[1fr_4fr] gap-2 w-full">
                <Label
                    htmlFor="node-id"
                    className="text-right text-lg self-center"
                >
                    Id
                </Label>
                <div className="flex gap-2">
                    <Input
                        type="text"
                        id="node-id"
                        name="id"
                        value={workingNode.id || selectedNode.id}
                        onChange={(event) => {
                            setWorkingNodeAttr((draft) => {
                                draft.id = event.target.value;
                            });
                        }}
                        maxLength={MAX_ID_LENGTH}
                    />
                    <Copy
                        size={20}
                        className="cursor-pointer"
                        onClick={() =>
                            navigator.clipboard.writeText(workingNode.id)
                        }
                    ></Copy>
                </div>

                <Label
                    htmlFor="node-title"
                    className="text-right text-lg self-center"
                >
                    Title
                </Label>
                <Input
                    type="text"
                    id="node-title"
                    name="title"
                    value={workingNode.data.title}
                    onChange={(event) => {
                        setWorkingNodeAttr((draft) => {
                            draft.data.title = event.target.value;
                        });
                    }}
                    ref={titleElem}
                />

                <Label
                    htmlFor="node-status"
                    className="text-right text-lg self-center"
                >
                    Status
                </Label>
                <Input
                    type="text"
                    id="node-status"
                    name="status"
                    value={workingNode.data.status}
                    onChange={(event) =>
                        setWorkingNodeAttr((draft) => {
                            draft.data.status = event.target.value;
                        })
                    }
                />

                <Label
                    htmlFor="node-team"
                    className="text-right text-lg self-center"
                >
                    Team
                </Label>
                <Select
                    value={workingNode.data.teamId}
                    onValueChange={(value) =>
                        setWorkingNodeAttr((draft) => {
                            draft.data.teamId = value;
                        })
                    }
                    name="team"
                >
                    <SelectTrigger id="node-team">
                        <SelectValue
                            placeholder={
                                teams[workingNode.data.teamId]?.name ||
                                "Select a team"
                            }
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(teams).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                                {value.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Label
                    htmlFor="node-day"
                    className="text-right text-lg self-center"
                >
                    Day
                </Label>
                {/* Select to set the day the data belongs to */}
                <Select
                    value={workingNode.data.day.toString()}
                    onValueChange={(value) =>
                        setWorkingNodeAttr((draft) => {
                            draft.data.day = parseInt(value);
                        })
                    }
                    name="day"
                >
                    <SelectTrigger id="node-team">
                        <SelectValue
                            placeholder={`Day ${workingNode.data.day}`}
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: numberOfDays }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                                Day {i + 1}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <hr className="col-span-2 my-0.5" />

                <Label
                    htmlFor="node-image-url"
                    className="text-right text-lg self-center"
                >
                    Image URL
                </Label>
                <Input
                    type="text"
                    id="node-image-url"
                    name="imageUrl"
                    value={workingNode.data.imageSrc}
                    onChange={(event) =>
                        setWorkingNodeAttr((draft) => {
                            draft.data.imageSrc = event.target.value;
                        })
                    }
                    onBlur={(event) => commitImageSrc(event.target.value)}
                    required
                />

                <Label
                    htmlFor="node-bg-card-color"
                    className="text-right text-lg self-center"
                >
                    Card Color
                </Label>
                <div className="flex flex-row gap-2">
                    <Input
                        type="color"
                        id="node-bg-card-color"
                        name="bgCardColor"
                        value={workingNode.data.bgCardColor}
                        onChange={(event) =>
                            setWorkingNodeAttr((draft) => {
                                draft.data.bgCardColor = event.target.value;
                            })
                        }
                        required
                    />
                    <div className="col-span-2">
                        <Button type="button" onClick={extractColorsFromImage}>
                            Extract colors from image
                        </Button>
                        <div className="h-4 mt-2 gap-2 flex flex-row">
                            {extractedColors.map((color) => {
                                return (
                                    <button
                                        key={color}
                                        className="h-4 w-4 border border-black rounded-full flex-none"
                                        style={{ backgroundColor: color }}
                                        onClick={() =>
                                            setWorkingNodeAttr((draft) => {
                                                draft.data.bgCardColor = color;
                                            })
                                        }
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>

                <span className="text-lg text-right">Image Preview</span>
                <img src={imgPreviewLink} className="h-16 w-16" />

                <hr className="col-span-2 my-0.5" />

                <Label
                    htmlFor="node-status"
                    className="text-lg self-center col-span-2"
                >
                    Node Day Content
                </Label>
                <div
                    className="col-span-2"
                    data-color-mode={isDarkMode ? "dark" : "light"}
                >
                    <MDEditor
                        id="node-content"
                        textareaProps={{ name: "content" }}
                        value={workingNode.data.content}
                        onChange={(content) =>
                            setWorkingNodeAttr((draft) => {
                                draft.data.content = content || "";
                            })
                        }
                    />
                </div>
            </div>

            <div className="flex flex-row gap-16">
                <Button onClick={handleSave}>Save</Button>
                <Button onClick={deleteNode}>Delete</Button>
            </div>
        </EditorCard>
    );
}
