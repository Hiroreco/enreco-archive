"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CommonItemData } from "@/lib/type";
import MDEditor from "@uiw/react-md-editor";
import { produce } from "immer";
import { useState } from "react";

const EMPTY_ITEM: CommonItemData = {
    id: "",
    name: "",
    modelSrc: "",
    imageSrc: "",
    thumbnailSrc: "",
    wielder: "",
    wielderSrc: "",
    content: "",
};

const EditorItemsApp = () => {
    const [items, setItems] = useState<CommonItemData[]>([]);
    const [selectedItem, setSelectedItem] = useState<CommonItemData | null>(
        null,
    );
    const [workingItem, setWorkingItem] = useState<CommonItemData>(EMPTY_ITEM);

    const handleSave = () => {
        if (selectedItem) {
            // Update existing item
            setItems(
                produce(items, (draft) => {
                    const index = draft.findIndex(
                        (item) => item.id === selectedItem.id,
                    );
                    if (index !== -1) {
                        draft[index] = workingItem;
                    }
                }),
            );
        } else {
            // Add new item
            setItems([...items, workingItem]);
        }
        setSelectedItem(workingItem);
    };

    const handleDelete = () => {
        if (selectedItem) {
            setItems(items.filter((item) => item.id !== selectedItem.id));
            setSelectedItem(null);
            setWorkingItem(EMPTY_ITEM);
        }
    };

    const handleImport = () => {
        // TODO: Implement import functionality
    };

    const handleExport = () => {
        // TODO: Implement export functionality
    };

    const updateWorkingItem = (updates: Partial<CommonItemData>) => {
        setWorkingItem(
            produce(workingItem, (draft) => {
                Object.assign(draft, updates);
            }),
        );
    };

    return (
        <div className="p-4">
            <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <Button onClick={handleImport}>Import Data</Button>
                    <Button onClick={handleSave}>Save Data</Button>
                    <Button onClick={handleExport}>Export Data</Button>
                </div>

                <div className="flex gap-4 items-center">
                    <Label htmlFor="item-select">Select Item</Label>
                    <Select
                        value={selectedItem?.id}
                        onValueChange={(value: string) => {
                            const item = items.find(
                                (item) => item.id === value,
                            );
                            setSelectedItem(item || null);
                        }}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select an item" />
                        </SelectTrigger>
                        <SelectContent>
                            {items.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                    {item.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-4 items-center">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        placeholder="Name"
                        className="grow"
                        value={workingItem.name}
                        onChange={(e) =>
                            updateWorkingItem({ name: e.target.value })
                        }
                    />
                </div>

                <div className="flex gap-4 items-center">
                    <Label htmlFor="modelSrc">Model Source</Label>
                    <Input
                        id="modelSrc"
                        placeholder="Model Source"
                        className="grow"
                        value={workingItem.modelSrc}
                        onChange={(e) =>
                            updateWorkingItem({ modelSrc: e.target.value })
                        }
                    />
                </div>

                <div className="flex gap-4 items-center">
                    <Label htmlFor="imageSrc">Image Source</Label>
                    <Input
                        id="imageSrc"
                        placeholder="Image Source"
                        className="grow"
                        value={workingItem.imageSrc}
                        onChange={(e) =>
                            updateWorkingItem({ imageSrc: e.target.value })
                        }
                    />
                </div>

                <div className="flex gap-4 items-center">
                    <Label htmlFor="thumbnailSrc">Thumbnail Source</Label>
                    <Input
                        id="thumbnailSrc"
                        placeholder="Thumbnail Source"
                        className="grow"
                        value={workingItem.thumbnailSrc}
                        onChange={(e) =>
                            updateWorkingItem({
                                thumbnailSrc: e.target.value,
                            })
                        }
                    />
                </div>

                <div className="flex gap-4 items-center">
                    <Label htmlFor="wielder">Wielder Name</Label>
                    <Input
                        id="wielder"
                        placeholder="Wielder Name"
                        className="grow"
                        value={workingItem.wielder}
                        onChange={(e) =>
                            updateWorkingItem({ wielder: e.target.value })
                        }
                    />
                </div>

                <div className="flex gap-4 items-center">
                    <Label htmlFor="wielderSrc">Wielder Source</Label>
                    <Input
                        id="wielderSrc"
                        placeholder="Wielder Source"
                        className="grow"
                        value={workingItem.wielderSrc}
                        onChange={(e) =>
                            updateWorkingItem({
                                wielderSrc: e.target.value,
                            })
                        }
                    />
                </div>

                <div className="flex gap-4 items-center">
                    <Label htmlFor="content">Content</Label>
                    <div className="grow">
                        <MDEditor
                            id="content"
                            value={workingItem.content}
                            onChange={(value) =>
                                updateWorkingItem({ content: value || "" })
                            }
                            textareaProps={{ name: "content" }}
                        />
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <Button onClick={handleDelete}>Delete Item</Button>
                    <Button onClick={handleDelete}>Delete Item</Button>
                </div>
            </div>
        </div>
    );
};

export default EditorItemsApp;
