"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { CommonItemData, GalleryImage, MiscelPageData } from "@/lib/type";
import MDEditor from "@uiw/react-md-editor";
import { produce } from "immer";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import slug from "slug";

const EMPTY_ITEM: CommonItemData = {
    id: "",
    name: "",
    modelSrc: "",
    imageSrc: "",
    thumbnailSrc: "",
    content: "",
    quote: "",
    galleryImages: [],
};

const EditorItemsApp = () => {
    const [items, setItems] = useState<MiscelPageData>([]);
    const [selectedItem, setSelectedItem] = useState<CommonItemData | null>(
        null,
    );
    const [workingItem, setWorkingItem] = useState<CommonItemData>(EMPTY_ITEM);
    const [autoGenIdFromName, setAutoGenIdFromName] = useState(false);

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

    const handleImport = async () => {
        const fileInput = document.createElement("input");
        fileInput.setAttribute("type", "file");
        fileInput.setAttribute("accept", "application/json");

        fileInput.addEventListener("change", async (event) => {
            const target = event.target as HTMLInputElement;
            if (!target.files?.length) return;

            const file = target.files[0];
            try {
                const text = await file.text();
                const importedItems = JSON.parse(text) as MiscelPageData;
                console.log("Imported items:", importedItems);
                setItems(importedItems);
            } catch (error) {
                console.error("Error importing items:", error);
                // TODO: Add proper error handling/user feedback
            }
        });

        fileInput.click();
    };

    const handleExport = () => {
        try {
            const itemsJson = JSON.stringify(items, null, 2);
            const blob = new Blob([itemsJson], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const downloadLink = document.createElement("a");
            downloadLink.href = url;
            downloadLink.download = `enreco-items-${new Date().toISOString()}.json`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting items:", error);
        }
    };

    const handleAdd = () => {
        const newItem = { ...EMPTY_ITEM, id: Date.now().toString() };
        setWorkingItem(newItem);
        setItems([...items, newItem]);
        setSelectedItem(newItem);
    };

    const updateWorkingItem = (updates: Partial<CommonItemData>) => {
        setWorkingItem(
            produce(workingItem, (draft) => {
                Object.assign(draft, updates);
            }),
        );
    };

    const handleAddGalleryImage = () => {
        const newImage: GalleryImage = {
            source: "",
            title: "",
        };
        updateWorkingItem({
            galleryImages: [...workingItem.galleryImages, newImage],
        });
    };

    const handleUpdateGalleryImage = (
        index: number,
        updates: Partial<GalleryImage>,
    ) => {
        updateWorkingItem({
            galleryImages: workingItem.galleryImages.map((img, i) =>
                i === index ? { ...img, ...updates } : img,
            ),
        });
    };

    const handleRemoveGalleryImage = (index: number) => {
        updateWorkingItem({
            galleryImages: workingItem.galleryImages.filter(
                (_, i) => i !== index,
            ),
        });
    };

    return (
        <div className="p-4 flex items-center gap-4 w-full">
            {/* Edit stuff here */}
            <div className="flex flex-col gap-4 w-[700px]">
                <div className="flex gap-4">
                    <Button onClick={handleImport}>Import</Button>
                    <Button onClick={handleExport}>Export</Button>
                    <Button onClick={handleAdd}>Add</Button>
                </div>

                <div className="flex gap-4 items-center">
                    <Label htmlFor="item-select">Select Item</Label>
                    <Select
                        value={selectedItem?.id}
                        onValueChange={(value: string) => {
                            const item = items.find(
                                (item) => item.id === value,
                            );
                            setSelectedItem(item || EMPTY_ITEM);
                            setWorkingItem(item || EMPTY_ITEM);
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
                <div className="flex flex-row content-center gap-2 mb-4">
                    <Checkbox
                        id="autoGenId"
                        checked={autoGenIdFromName}
                        onCheckedChange={(checked) => {
                            setAutoGenIdFromName(checked === true);
                            if (checked === true) {
                                const newId = slug(workingItem.name);
                                updateWorkingItem({ id: newId });
                            }
                        }}
                    />
                    <Label htmlFor="autoGenId">
                        Auto-generate id from name
                    </Label>
                </div>

                <div className="flex gap-4 items-center">
                    <Label htmlFor="id">Id</Label>
                    <Input
                        id="id"
                        placeholder="Id"
                        className=" disabled:bg-gray-200"
                        value={workingItem.id}
                        onChange={(e) =>
                            updateWorkingItem({ id: e.target.value })
                        }
                        disabled={autoGenIdFromName}
                    />
                </div>

                <div className="flex gap-4 items-center">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        placeholder="Name"
                        className=""
                        value={workingItem.name}
                        onChange={(e) => {
                            const newName = e.target.value;
                            if (autoGenIdFromName) {
                                updateWorkingItem({
                                    name: newName,
                                    id: slug(newName),
                                });
                            } else {
                                updateWorkingItem({ name: newName });
                            }
                        }}
                    />
                </div>

                <div className="flex gap-4 items-center">
                    <Label htmlFor="modelSrc">Model Source</Label>
                    <Input
                        id="modelSrc"
                        placeholder="Model Source"
                        className=""
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
                        className=""
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
                        className=""
                        value={workingItem.thumbnailSrc}
                        onChange={(e) =>
                            updateWorkingItem({
                                thumbnailSrc: e.target.value,
                            })
                        }
                    />
                </div>

                <div className="flex gap-4 items-center">
                    <Label htmlFor="quote">Quote</Label>
                    <Input
                        id="quote"
                        placeholder="Quote"
                        className=""
                        value={workingItem.quote}
                        onChange={(e) =>
                            updateWorkingItem({
                                quote: e.target.value,
                            })
                        }
                    />
                </div>

                <div>
                    <Label htmlFor="content">Content</Label>
                    <div className="">
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
                    <Button onClick={handleSave}>Save</Button>
                    <Button onClick={handleDelete}>Delete</Button>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <Label>Gallery Images</Label>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddGalleryImage}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Image
                </Button>

                <div className="grid grid-cols-3 gap-4">
                    {workingItem.galleryImages.map((image, index) => (
                        <Card key={index} className="p-4">
                            <CardContent className="flex flex-col gap-4 pt-0">
                                <div className="flex gap-4 items-center">
                                    <Label>Full Size URL</Label>
                                    <Input
                                        value={image.source}
                                        onChange={(e) =>
                                            handleUpdateGalleryImage(index, {
                                                source: e.target.value,
                                            })
                                        }
                                        placeholder="Full Size Image URL"
                                        className=""
                                    />
                                </div>

                                <div className="flex gap-4 items-center">
                                    <Label>Title</Label>
                                    <Input
                                        value={image.title}
                                        onChange={(e) =>
                                            handleUpdateGalleryImage(index, {
                                                title: e.target.value,
                                            })
                                        }
                                        placeholder="Image Title"
                                        className=""
                                    />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() =>
                                            handleRemoveGalleryImage(index)
                                        }
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Model preview here */}
            {/* <div className="flex flex-col gap-4">
                <ViewModelViewer modelPath={workingItem.modelSrc || "/"} />
                <img
                    src={workingItem.imageSrc || undefined}
                    className="w-[300px] aspect-square rounded-lg border"
                />
            </div> */}
        </div>
    );
};

export default EditorItemsApp;
