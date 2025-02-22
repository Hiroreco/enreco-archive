import { useState } from "react";

import EditorCard from "@/components/editor/EditorCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Team, TeamMap } from "@/lib/type";

import { CheckedState } from "@radix-ui/react-checkbox";
import { produce } from "immer";
import { LucideX } from "lucide-react";
import slug from "slug";

interface FormElements extends HTMLFormControlsCollection {
    newTeamId: HTMLInputElement;
    newTeamName: HTMLInputElement;
    newTeamIconUrl: HTMLInputElement;
}

interface AddNewTeamFormElement extends HTMLFormElement {
    readonly elements: FormElements;
}

interface EditorTeamsCardProps {
    isVisible: boolean;
    teamData: TeamMap;
    onTeamsChange: (teams: TeamMap) => void;
    onCardClose: () => void;
}

export default function EditorTeamsCard({
    isVisible,
    teamData,
    onTeamsChange,
    onCardClose,
}: EditorTeamsCardProps) {
    const [autoGenIdFromName, setAutoGenIdFromName] = useState(true);
    const [teams, setTeams] = useState<TeamMap>(teamData);

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
        while (teams[actualId]) {
            actualId = `${id}-${counter}`;
            counter++;
        }

        return actualId;
    };

    const setId = (id: string, newId: string) => {
        if (!teams[id] || teams[id].id === newId) {
            return;
        }

        newId = getUniqueId(newId);

        setTeams(
            produce((teams) => {
                teams[newId] = teams[id];
                teams[newId].id = newId;
                delete teams[id];
            }),
        );
    };

    const setName = (id: string, newName: string) => {
        if (!teams[id] || teams[id].name === newName) {
            return;
        }

        let newId = id;
        if (autoGenIdFromName) {
            newId = getUniqueId(slug(newName));
        }

        setTeams(
            produce((teams) => {
                teams[id].name = newName;

                if (autoGenIdFromName) {
                    teams[newId] = teams[id];
                    teams[newId].id = newId;
                    delete teams[id];
                }
            }),
        );
    };

    const setIconSrc = (id: string, newIconSrc: string) => {
        if (!teams[id] || teams[id].teamIconSrc === newIconSrc) {
            return;
        }

        setTeams(
            produce((teams) => {
                teams[id].teamIconSrc = newIconSrc;
            }),
        );
    };

    const addNewTeam = (event: React.FormEvent<AddNewTeamFormElement>) => {
        event.preventDefault();
        let newTeamId = event.currentTarget.elements.newTeamId.value;
        const newTeamName = event.currentTarget.elements.newTeamName.value;
        const newTeamIconUrl =
            event.currentTarget.elements.newTeamIconUrl.value;

        if ((!autoGenIdFromName && !newTeamId) || !newTeamName) {
            return;
        }

        if (autoGenIdFromName) {
            newTeamId = getUniqueId(slug(newTeamName));
        }

        setTeams(
            produce((teams) => {
                teams[newTeamId] = {
                    id: newTeamId,
                    name: newTeamName,
                    teamIconSrc: newTeamIconUrl,
                };
            }),
        );

        event.currentTarget.elements.newTeamId.value = "";
        event.currentTarget.elements.newTeamName.value = "";
        event.currentTarget.elements.newTeamIconUrl.value = "";
    };

    const onSave = () => {
        onTeamsChange(teams);
    };

    const onClose = () => {
        setTeams(teamData);
        onCardClose();
    };

    if (!isVisible) {
        return;
    }

    return (
        <EditorCard>
            <h1 className="text-2xl font-bold">Chapter Teams</h1>

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
                            className="bg-secondary text-left border border-black p-2 w-16"
                        >
                            Icon
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
                            Icon Image URL
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {Object.values(teams).map((team: Team) => {
                        return (
                            <tr key={team.id}>
                                <td className="border border-black p-2">
                                    <img
                                        src={team.teamIconSrc}
                                        width={64}
                                        height={64}
                                    />
                                </td>
                                <td className="border border-black p-2">
                                    <input
                                        type="text"
                                        name="id"
                                        defaultValue={team.id}
                                        onBlur={(event) =>
                                            setId(team.id, event.target.value)
                                        }
                                        disabled={autoGenIdFromName}
                                        className="w-full border rounded-lg bg-secondary disabled:opacity-50"
                                    />
                                </td>
                                <td className="border border-black p-2">
                                    <input
                                        type="text"
                                        name="name"
                                        defaultValue={team.name}
                                        onBlur={(event) =>
                                            setName(team.id, event.target.value)
                                        }
                                        className="w-full border rounded-lg bg-secondary"
                                    />
                                </td>
                                <td className="border border-black p-2">
                                    <input
                                        type="text"
                                        name="iconUrl"
                                        defaultValue={team.teamIconSrc}
                                        onBlur={(event) =>
                                            setIconSrc(
                                                team.id,
                                                event.target.value,
                                            )
                                        }
                                        className="w-full border rounded-lg bg-secondary"
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <form className="grid grid-col-2 gap-2" onSubmit={addNewTeam}>
                <span className="text-lg col-span-2">Add New Team</span>

                <Label htmlFor="new-team-id" className="text-right text-md">
                    Id
                </Label>
                <input
                    type="text"
                    id="new-team-id"
                    name="newTeamId"
                    disabled={autoGenIdFromName}
                    className="border rounded-lg bg-secondary disabled:opacity-50"
                    required
                />

                <Label htmlFor="new-team-name" className="text-right text-md">
                    Name
                </Label>
                <input
                    type="text"
                    id="new-team-name"
                    name="newTeamName"
                    className="border rounded-lg bg-secondary"
                    required
                />

                <Label
                    htmlFor="new-team-icon-url"
                    className="text-right text-md"
                >
                    Icon URL
                </Label>
                <input
                    type="text"
                    id="new-team-icon-url"
                    name="newTeamIconUrl"
                    className="border rounded-lg bg-secondary"
                />

                <Button type="submit" className="col-span-2">
                    Add New Team
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
