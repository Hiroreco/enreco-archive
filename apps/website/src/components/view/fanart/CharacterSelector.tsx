import { useTranslations } from "next-intl";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@enreco-archive/common-ui/components/dialog";
import { Button } from "@enreco-archive/common-ui/components/button";
import { Checkbox } from "@enreco-archive/common-ui/components/checkbox";
import { ChevronDown } from "lucide-react";

interface CharacterSelectorProps {
    selectedCharacters: string[];
    characters: string[];
    nameMap: Record<string, string>;
    onCharactersChange: (characters: string[]) => void;
    mobile: boolean;
}

const CharacterSelector = ({
    selectedCharacters,
    characters,
    nameMap,
    onCharactersChange,
    mobile,
}: CharacterSelectorProps) => {
    const t = useTranslations("modals.art");
    const handleCharacterClick = (character: string) => {
        if (selectedCharacters.includes("all")) {
            onCharactersChange([character]);
        } else if (selectedCharacters.includes(character)) {
            const next = selectedCharacters.filter((c) => c !== character);
            onCharactersChange(next.length === 0 ? ["all"] : next);
        } else {
            onCharactersChange([...selectedCharacters, character]);
        }
    };

    const getCharacterName = (character: string) => {
        return (
            nameMap[character] ||
            character.charAt(0).toUpperCase() + character.slice(1)
        );
    };

    if (mobile) {
        const [open, setOpen] = useState(false);

        const renderLabel = () => {
            if (selectedCharacters.includes("all")) return t("charFilter.all");
            if (selectedCharacters.includes("various")) return t("charFilter.various");
            const names = selectedCharacters
                .map((c) => getCharacterName(c))
                .slice(0, 2);
            return names.length === 0 ? t("charFilter.all") : names.join(", ") + (selectedCharacters.length > 2 ? "…" : "");
        };

        return (
            <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">
                    {t("character")}
                </label>
                <div>
                    <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="w-full text-left">
                        <span className="flex items-center justify-between w-full">
                            <span className="truncate">{renderLabel()}</span>
                            <ChevronDown className="w-4 h-4 ml-2 opacity-60" />
                        </span>
                    </Button>

                    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
                        <DialogContent className="max-w-md w-[90vw]">
                            <div className="flex flex-col gap-3 relative">
                                <div className="flex items-center justify-between">
                                    <DialogTitle className="text-sm font-semibold">{t("character")}</DialogTitle>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="flex items-center gap-2">
                                        <Checkbox
                                            checked={selectedCharacters.includes("all")}
                                            onCheckedChange={(checked) => {
                                                if (checked) onCharactersChange(["all"]);
                                            }}
                                        />
                                        <span className="text-sm">{t("charFilter.all")}</span>
                                    </label>

                                    <label className="flex items-center gap-2">
                                        <Checkbox
                                            checked={selectedCharacters.includes("various")}
                                            onCheckedChange={() => handleCharacterClick("various")}
                                        />
                                        <span className="text-sm">{t("charFilter.various")}</span>
                                    </label>

                                    <div className="border-t pt-2">
                                        {characters.map((character) => (
                                            <label key={character} className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={selectedCharacters.includes(character)}
                                                    onCheckedChange={() => handleCharacterClick(character)}
                                                />
                                                <span className="text-sm">{getCharacterName(character)}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button size="sm" onClick={() => setOpen(false)} aria-label="Close">Close</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <label className="text-sm font-medium">{t("character")}:</label>
            <div className="flex flex-wrap gap-1">
                <button
                    type="button"
                    className={`px-2 py-1 rounded border text-xs ${
                        selectedCharacters.includes("all")
                            ? "bg-accent border-accent-foreground text-accent-foreground"
                            : "bg-background border-border"
                    }`}
                    onClick={() => onCharactersChange(["all"])}
                >
                    {t("charFilter.all")}
                </button>
                <button
                    type="button"
                    className={`px-2 py-1 rounded border text-xs ${
                        selectedCharacters.includes("various")
                            ? "bg-accent border-accent-foreground text-accent-foreground"
                            : "bg-background border-border"
                    }`}
                    onClick={() => handleCharacterClick("various")}
                >
                    {t("charFilter.various")}
                </button>
                {characters.map((character) => (
                    <button
                        type="button"
                        key={character}
                        className={`px-2 py-1 rounded border text-xs ${
                            selectedCharacters.includes(character)
                                ? "bg-accent border-accent-foreground text-accent-foreground"
                                : "bg-background border-border"
                        }`}
                        onClick={() => handleCharacterClick(character)}
                    >
                        {getCharacterName(character)}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CharacterSelector;
