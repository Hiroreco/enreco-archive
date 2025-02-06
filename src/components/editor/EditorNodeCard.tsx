import EditorCard from "@/components/editor/EditorCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { EditorImageNodeType, TeamMap } from "@/lib/type";

import { CheckedState } from "@radix-ui/react-checkbox";
import MDEditor from "@uiw/react-md-editor";
import { extractColors } from "extract-colors";
import { produce, WritableDraft } from "immer";
import { LucideX } from "lucide-react";
import { useState } from "react";
import slug from "slug";

const MAX_ID_LENGTH = 30;

function getUniqueId(newId: string, origId: string, nodeIds: string[]) {
    if(newId === origId) {
        return origId;
    }

    let actualId = newId;
    let counter = 1;
    while(nodeIds.filter(nodeId => nodeId === actualId).length !== 0) {
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
    updateNode: (oldNode: EditorImageNodeType, newNode: EditorImageNodeType) => void;
    deleteNode: () => void;
    onCardClose: () => void;
}

export default function EditorNodeCard({
    isVisible,
    teams,
    nodes,
    selectedNode,
    updateNode,
    deleteNode,
    onCardClose
}: EditorNodeCardProps) {
    const [autoGenIdFromTitle, setAutoGenIdFromTitle] = useState(true);
    const [workingNode, setWorkingNode] = useState(selectedNode);
    const [imgPreviewLink, setImgPreviewLink] = useState(selectedNode.data.imageSrc || "/default-node-image.png")
    const [extractedColors, setExtractedColors] = useState<string[]>([]);

    const nodeIds = nodes.map(node => node.id);

    const onToggleAutoGenId = (checkedState: CheckedState) => {
        if(checkedState === true) {
            setAutoGenIdFromTitle(true);
            const newId = generateIdFromTitle(workingNode.data.title);
            setWorkingNodeAttr(draft => { draft.id = newId });
        } else {
            setAutoGenIdFromTitle(false);
        }
    };

    const handleSave = () => {
        updateNode(selectedNode, workingNode);
    };

    const commitId = (newId: string) => {
        newId = getUniqueId(newId, selectedNode.id, nodeIds);

        setWorkingNode(
            produce(workingNode, draft => {
                draft.id = newId;
            })
        );
    };

    const generateIdFromTitle = (title: string) => {
        const truncTitle = title.length > MAX_ID_LENGTH ? title.substring(0, MAX_ID_LENGTH) : title;
        return getUniqueId(slug(truncTitle), selectedNode.id, nodeIds);
    }

    const commitTitle = (newTitle: string) => {
        let newId = "";
        if(autoGenIdFromTitle) {
            newId = generateIdFromTitle(newTitle);
        }

        setWorkingNode(
            produce(workingNode, (draft) => {
                draft.data.title = newTitle;

                if(autoGenIdFromTitle) {
                    draft.id = newId;
                }
            }
        ));
    };

    const commitImageSrc = (newImageSrc: string) => {
        setImgPreviewLink(newImageSrc);
        setExtractedColors([]);
    }

    const setWorkingNodeAttr = (updater: (draft: WritableDraft<EditorImageNodeType>) => void) => {
        setWorkingNode(
            produce(workingNode, updater)
        );
    }

    const extractColorsFromImage = async () => {
        const imgColors = await extractColors(imgPreviewLink);
        imgColors.sort((a,b) => b.area - a.area);
        setExtractedColors(imgColors.slice(0, 5).map(color => color.hex));
        setWorkingNodeAttr(draft => { draft.data.bgCardColor = imgColors[0].hex });
    }

    const onClose = () => {
        onCardClose();
    }

    if(!isVisible) {
        return;
    }

    return (
        <EditorCard>
            <h1 className="text-xl font-bold">Node editor</h1>

            <Button onClick={onClose} className="absolute top-2 right-2">
                <LucideX />
            </Button>

            <div className="flex flex-row content-center gap-2">
                <Checkbox id="autoGenId" checked={autoGenIdFromTitle} onCheckedChange={onToggleAutoGenId}/>
                <Label htmlFor="autoGenId">Auto-generate id from title</Label>
            </div>

            <div className="grid grid-cols-[1fr_4fr] gap-2 w-full">
                <Label htmlFor="node-id" className="text-right text-lg self-center">Id</Label>
                <Input 
                    type="text" 
                    id="node-id" 
                    name="id" 
                    value={workingNode.id || selectedNode.id}
                    onChange={(event) => { setWorkingNodeAttr(draft => {draft.id = event.target.value}) }}
                    onBlur={(event) => commitId(event.target.value)}
                    disabled={autoGenIdFromTitle}
                    className="disabled:bg-gray-200"
                    maxLength={MAX_ID_LENGTH}
                />

                <Label htmlFor="node-title" className="text-right text-lg self-center">Title</Label>
                <Input 
                    type="text" 
                    id="node-title" 
                    name="title"
                    value={workingNode.data.title}
                    onChange={(event) => { setWorkingNodeAttr(draft => {draft.data.title = event.target.value}) }}
                    onBlur={(event) => commitTitle(event.target.value)}
                />

                <Label htmlFor="node-status" className="text-right text-lg self-center">Status</Label>
                <Input
                    type="text"
                    id="node-status"
                    name="status"
                    value={workingNode.data.status}
                    onChange={(event) => setWorkingNodeAttr(draft => { draft.data.status = event.target.value })}
                />

                <Label htmlFor="node-team" className="text-right text-lg self-center">Team</Label>
                <Select 
                    value={workingNode.data.teamId} 
                    onValueChange={(value) => setWorkingNodeAttr(draft => { draft.data.teamId = value })}
                    name="team"
                >
                    <SelectTrigger id="node-team">
                        <SelectValue placeholder={teams[workingNode.data.teamId]?.name || "Select a team"} />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(teams).map((key) => (
                            <SelectItem key={key} value={key}>
                                { teams[key].name }
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="flex flex-row gap-2 col-start-2 items-center">
                    <Checkbox
                        id="node-isNew"
                        name="isNew"
                        checked={workingNode.data.new}
                        onCheckedChange={(checked) => 
                            checked === true ? 
                            setWorkingNodeAttr(draft => { draft.data.new = true }) : 
                            setWorkingNodeAttr(draft => { draft.data.new = false })
                        }
                    />
                    <Label htmlFor="node-isNew" className="text-lg">New</Label>
                </div>

                <hr className="col-span-2 my-0.5" />

                <Label htmlFor="node-image-url" className="text-right text-lg self-center">Image URL</Label>
                <Input
                    type="text"
                    id="node-image-url"
                    name="imageUrl"
                    value={workingNode.data.imageSrc}
                    onChange={(event) => setWorkingNodeAttr(draft => { draft.data.imageSrc = event.target.value })}
                    onBlur={(event) => commitImageSrc(event.target.value)}
                    required
                />

                <Label htmlFor="node-bg-card-color" className="text-right text-lg self-center">Card Color</Label>
                <div className="flex flex-row gap-2">
                    <Input
                        type="color"
                        id="node-bg-card-color"
                        name="bgCardColor"
                        value={workingNode.data.bgCardColor}
                        onChange={(event) => setWorkingNodeAttr(draft => { draft.data.bgCardColor = event.target.value })}
                        required
                    />
                    <div className="col-span-2" >
                        <Button type="button" onClick={extractColorsFromImage}>Extract colors from image</Button>
                        <div className="h-4 mt-2 gap-2 flex flex-row">
                            {
                                extractedColors.map(color => {
                                    return (
                                        <button
                                            key={color}
                                            className="h-4 w-4 border border-black rounded-full flex-none" 
                                            style={{ backgroundColor: color }}
                                            onClick={() => setWorkingNodeAttr(draft => { draft.data.bgCardColor = color; })}
                                        />
                                    );
                                })
                            }
                        </div>
                    </div>
                </div>
                
                <span className="text-lg text-right">Image Preview</span>
                <img 
                    src={imgPreviewLink}
                    className="h-16 w-16"
                />

                <hr className="col-span-2 my-0.5" />

                <Label htmlFor="node-status" className="text-lg self-center col-span-2">Node Day Content</Label>
                <MDEditor
                    id="node-content"
                    textareaProps={{name: "content"}}
                    value={workingNode.data.content}
                    onChange={(content) => setWorkingNodeAttr(draft => { draft.data.content = content || "" })}
                    className="col-span-2"
                />
            </div>

            <div className="flex flex-row gap-16">
                <Button onClick={handleSave}>Save</Button>
                <Button onClick={deleteNode}>Delete</Button>
            </div>
        </EditorCard>
    );
}
