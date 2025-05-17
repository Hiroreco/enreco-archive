import EditorCard from "@/components/editor/EditorCard";
import { Button } from "@enreco-archive/common-ui/components/button";
import { Checkbox } from "@enreco-archive/common-ui/components/checkbox";
import { Label } from "@enreco-archive/common-ui/components/label";
import { Relationship, RelationshipMap } from "@/lib/type";

import { CheckedState } from "@radix-ui/react-checkbox";
import { produce } from "immer";
import { LucideX } from "lucide-react";
import { useState } from "react";
import slug from "slug";

interface FormElements extends HTMLFormControlsCollection {
    newRelationshipId: HTMLInputElement;
    newRelationshipName: HTMLInputElement;
    newRelationshipColor: HTMLInputElement;
    newRelationshipDashArray: HTMLInputElement;
}

interface AddNewRelationshipFormElement extends HTMLFormElement {
    readonly elements: FormElements;
}

interface EditorRelationshipsCardProps {
    isVisible: boolean;
    relationshipData: RelationshipMap;
    onRelationshipsChange: (relationships: RelationshipMap) => void;
    onCardClose: () => void;
}

export default function EditorRelationshipsCard({
    isVisible,
    relationshipData,
    onRelationshipsChange,
    onCardClose,
}: EditorRelationshipsCardProps) {
    const [autoGenIdFromName, setAutoGenIdFromName] = useState(true);
    const [relationships, setRelationships] = useState(relationshipData);

    const onToggleAutoGenId = (checkedState: CheckedState) => {
        if (checkedState === true) {
            setAutoGenIdFromName(true);
        } else {
            setAutoGenIdFromName(false);
        }
    };

    const getUniqueId = (id: string) => {
        let actualId = id;
        let counter = 1;
        while (relationships[actualId]) {
            actualId = `${id}-${counter}`;
            counter++;
        }

        return actualId;
    };

    const setId = (id: string, newId: string) => {
        if (!relationships[id] || relationships[id].id === newId) {
            return;
        }

        newId = getUniqueId(newId);

        setRelationships(
            produce((relationships) => {
                relationships[newId] = relationships[id];
                relationships[newId].id = newId;
                delete relationships[id];
            }),
        );
    };

    const setName = (id: string, newName: string) => {
        if (!relationships[id] || relationships[id].name === newName) {
            return;
        }

        let newId = id;
        if (autoGenIdFromName) {
            newId = getUniqueId(slug(newName));
        }

        setRelationships(
            produce((relationships) => {
                relationships[id].name = newName;

                if (autoGenIdFromName) {
                    relationships[newId] = relationships[id];
                    relationships[newId].id = newId;
                    delete relationships[id];
                }
            }),
        );
    };

    const setStrokeColor = (id: string, newColor: string) => {
        if (!relationships[id] || relationships[id].style.stroke === newColor) {
            return;
        }

        setRelationships(
            produce((relationships) => {
                relationships[id].style.stroke = newColor;
            }),
        );
    };

    const setStrokeDashArray = (id: string, newDashArray: string) => {
        if (
            !relationships[id] ||
            relationships[id].style.strokeDasharray === newDashArray
        ) {
            return;
        }

        setRelationships(
            produce((relationships) => {
                relationships[id].style.strokeDasharray = newDashArray;
            }),
        );
    };

    const addNewRelationship = (
        event: React.FormEvent<AddNewRelationshipFormElement>,
    ) => {
        event.preventDefault();
        let newRelId = event.currentTarget.elements.newRelationshipId.value;
        const newRelName =
            event.currentTarget.elements.newRelationshipName.value;
        const newRelColor =
            event.currentTarget.elements.newRelationshipColor.value;
        const newRelPattern =
            event.currentTarget.elements.newRelationshipDashArray.value;

        if ((!autoGenIdFromName && !newRelId) || !newRelName || !newRelColor) {
            return;
        }

        if (autoGenIdFromName) {
            newRelId = getUniqueId(slug(newRelName));
        }

        setRelationships(
            produce((relationships) => {
                relationships[newRelId] = {
                    id: newRelId,
                    name: newRelName,
                    style: {
                        stroke: newRelColor,
                        ...(newRelPattern
                            ? { strokeDasharray: newRelPattern }
                            : {}),
                    },
                };
            }),
        );

        event.currentTarget.elements.newRelationshipId.value = "";
        event.currentTarget.elements.newRelationshipName.value = "";
        event.currentTarget.elements.newRelationshipColor.value = "";
        event.currentTarget.elements.newRelationshipDashArray.value = "";
    };

    const onSave = () => {
        onRelationshipsChange(relationships);
    };

    const onClose = () => {
        setRelationships(relationshipData);
        onCardClose();
    };

    if (!isVisible) {
        return;
    }

    return (
        <EditorCard>
            <h1 className="text-2xl font-bold">Chapter Relationships</h1>

            <Button onClick={onClose} className="absolute top-2 right-2">
                <LucideX />
            </Button>

            <div className="flex flex-row content-center gap-2">
                <Checkbox
                    id="autoGenId"
                    checked={autoGenIdFromName}
                    onCheckedChange={onToggleAutoGenId}
                />
                <Label htmlFor="autoGenId">Auto-generate id from name</Label>
            </div>

            <table className="w-full table-fixed border border-black border-collapse">
                <thead>
                    <tr>
                        <th
                            scope="col"
                            className="bg-secondary text-left border border-black p-2 w-20"
                        >
                            Preview
                        </th>
                        <th
                            scope="col"
                            className="bg-secondary text-left border border-black p-2"
                        >
                            Id
                        </th>
                        <th
                            scope="col"
                            className="bg-secondary text-left border border-black p-2"
                        >
                            Name
                        </th>
                        <th
                            scope="col"
                            className="bg-secondary text-left border border-black p-2"
                        >
                            Line Color (stroke)
                        </th>
                        <th
                            scope="col"
                            className="bg-secondary text-left border border-black p-2"
                        >
                            Line Pattern (stroke-dasharray)
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {Object.values(relationships).map(
                        (relationship: Relationship) => {
                            return (
                                <tr key={relationship.id}>
                                    <td className="border border-black p-2">
                                        <svg
                                            viewBox="0 0 64 64"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <line
                                                x1="0"
                                                y1="32"
                                                x2="64"
                                                y2="32"
                                                style={{
                                                    strokeWidth: "0.5rem",
                                                    ...relationship.style,
                                                }}
                                            />
                                        </svg>
                                    </td>
                                    <td className="border border-black p-2">
                                        <input
                                            type="text"
                                            name="id"
                                            defaultValue={relationship.id}
                                            onBlur={(event) =>
                                                setId(
                                                    relationship.id,
                                                    event.target.value,
                                                )
                                            }
                                            disabled={autoGenIdFromName}
                                            className="w-full border rounded-lg bg-secondary disabled:opacity-50"
                                        />
                                    </td>
                                    <td className="border border-black p-2">
                                        <input
                                            type="text"
                                            name="name"
                                            defaultValue={relationship.name}
                                            onBlur={(event) =>
                                                setName(
                                                    relationship.id,
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full border rounded-lg bg-secondary "
                                        />
                                    </td>
                                    <td className="border border-black p-2">
                                        <input
                                            type="color"
                                            name="strokeColor"
                                            defaultValue={
                                                relationship.style.stroke
                                            }
                                            onBlur={(event) =>
                                                setStrokeColor(
                                                    relationship.id,
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full border rounded-lg bg-secondary p-0.5"
                                        />
                                    </td>
                                    <td className="border border-black p-2">
                                        <input
                                            type="text"
                                            name="strokeDashArray"
                                            defaultValue={
                                                relationship.style
                                                    .strokeDasharray
                                            }
                                            onBlur={(event) =>
                                                setStrokeDashArray(
                                                    relationship.id,
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full border rounded-lg bg-secondary"
                                        />
                                    </td>
                                </tr>
                            );
                        },
                    )}
                </tbody>
            </table>

            <form
                className="grid grid-col-2 gap-2"
                onSubmit={addNewRelationship}
            >
                <span className="text-lg col-span-2">Add New Relationship</span>

                <Label htmlFor="new-rel-id" className="text-right text-md">
                    Id
                </Label>
                <input
                    type="text"
                    id="new-rel-id"
                    name="newRelationshipId"
                    disabled={autoGenIdFromName}
                    className="border rounded-lg bg-secondary"
                    required
                />

                <Label htmlFor="new-rel-name" className="text-right text-md">
                    Name
                </Label>
                <input
                    type="text"
                    id="new-rel-name"
                    name="newRelationshipName"
                    className="border rounded-lg bg-secondary "
                    required
                />

                <Label htmlFor="new-rel-color" className="text-right text-md">
                    Line Color (stroke)
                </Label>
                <input
                    type="color"
                    defaultValue="#000000"
                    id="new-rel-color"
                    name="newRelationshipColor"
                    className="border rounded-lg p-0.5 bg-secondary "
                    required
                />

                <Label
                    htmlFor="new-rel-dasharray"
                    className="text-right text-md"
                >
                    Line Pattern (stroke-dasharray)
                </Label>
                <input
                    type="text"
                    id="new-rel-dasharray"
                    name="newRelationshipDashArray"
                    className="border rounded-lg bg-secondary "
                />

                <Button type="submit" className="col-span-2">
                    Add New Relationship
                </Button>
            </form>

            <div className="my-2 flex flex-row w-full justify-center">
                <Button className="w-2/4" onClick={onSave}>
                    Save
                </Button>
            </div>
        </EditorCard>
    );
}
