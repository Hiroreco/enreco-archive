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
import { CustomEdgeType, RelationshipMap } from "@/lib/type";
import MDEditor from "@uiw/react-md-editor";

import { produce, WritableDraft } from "immer";
import { Copy, LucideX } from "lucide-react";
import { useState } from "react";

interface EditorEdgeCard {
    isVisible: boolean;
    selectedEdge: CustomEdgeType;
    relationships: RelationshipMap;
    updateEdge: (oldEdge: CustomEdgeType, newEdge: CustomEdgeType) => void;
    deleteEdge: () => void;
    onCardClose: () => void;
    numberOfDays: number;
    isDarkMode: boolean;
}

const EdgeEditorCard = ({
    isVisible,
    selectedEdge,
    relationships,
    updateEdge,
    deleteEdge,
    onCardClose,
    numberOfDays,
    isDarkMode,
}: EditorEdgeCard) => {
    const [workingEdge, setWorkingEdge] = useState(selectedEdge);
    const handleSave = () => {
        updateEdge(selectedEdge, workingEdge);
    };

    const setWorkingEdgeAttr = (
        updater: (draft: WritableDraft<CustomEdgeType>) => void,
    ) => {
        setWorkingEdge(produce(workingEdge, updater));
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
                    <div className="text-xl font-bold">Edge Editor</div>
                    <Button onClick={onClose}>
                        <LucideX />
                    </Button>
                </div>
                <Separator className="mt-2" />
            </div>

            <div className="grid grid-cols-[1fr_4fr] gap-2 w-full">
                <Label className="text-right text-lg self-center">Id</Label>
                <div className="flex gap-2">
                    <span className="text-md self-center">
                        {workingEdge.id}
                    </span>
                    <Copy
                        size={20}
                        className="cursor-pointer"
                        onClick={() =>
                            navigator.clipboard.writeText(workingEdge.id)
                        }
                    />
                </div>

                <Label
                    htmlFor="edge-relationship"
                    className="text-right text-lg self-center"
                >
                    Relationship
                </Label>
                <Select
                    value={
                        workingEdge.data?.relationshipId ||
                        selectedEdge.data?.relationshipId
                    }
                    onValueChange={(value) =>
                        setWorkingEdgeAttr((draft) => {
                            draft.data!.relationshipId = value;
                        })
                    }
                >
                    <SelectTrigger id="edge-relationship">
                        <SelectValue
                            placeholder={
                                relationships[workingEdge.data!.relationshipId]
                                    ?.name || "Select a relationship"
                            }
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(relationships).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                                {value.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Label
                    htmlFor="edge-title"
                    className="text-right text-lg self-center"
                >
                    Title
                </Label>
                <Input
                    id="edge-title"
                    type="text"
                    value={workingEdge.data!.title}
                    onChange={(event) =>
                        setWorkingEdgeAttr((draft) => {
                            draft.data!.title = event.target.value;
                        })
                    }
                />

                <Label
                    htmlFor="node-day"
                    className="text-right text-lg self-center"
                >
                    Day
                </Label>
                {/* Select to set the day the data belongs to */}
                <Select
                    value={workingEdge.data?.day.toString()}
                    onValueChange={(value) =>
                        setWorkingEdgeAttr((draft) => {
                            if (draft.data) {
                                draft.data.day = parseInt(value);
                            }
                        })
                    }
                    name="day"
                >
                    <SelectTrigger id="node-team">
                        <SelectValue
                            placeholder={
                                workingEdge.data?.day !== undefined
                                    ? `Day ${workingEdge.data.day + 1}`
                                    : "Select a day"
                            }
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
                    htmlFor="node-status"
                    className="text-lg self-center col-span-2"
                >
                    Edge Day Content
                </Label>
                <div
                    className="col-span-2"
                    data-color-mode={isDarkMode ? "dark" : "light"}
                >
                    <MDEditor
                        id="node-content"
                        textareaProps={{ name: "content" }}
                        value={workingEdge.data?.content}
                        onChange={(content) =>
                            setWorkingEdgeAttr((draft) => {
                                if (draft.data) {
                                    draft.data.content = content || "";
                                }
                            })
                        }
                    />
                </div>
            </div>
            <div className="flex flex-row gap-16">
                <Button onClick={handleSave}>Save</Button>
                <Button onClick={deleteEdge}>Delete</Button>
            </div>
        </EditorCard>
    );
};

export default EdgeEditorCard;
