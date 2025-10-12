import { Button } from "@enreco-archive/common-ui/components/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from "@enreco-archive/common-ui/components/dialog";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

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
    const tCommon = useTranslations("common");

    const handleCharacterClick = (character: string) => {
        if (
            character === "all" ||
            character === "various" ||
            character === "bloodraven"
        ) {
            onCharactersChange([character]);
        } else if (
            selectedCharacters.includes("all") ||
            selectedCharacters.includes("various") ||
            selectedCharacters.includes("bloodraven")
        ) {
            onCharactersChange([character]);
        } else if (selectedCharacters.includes(character)) {
            const next = selectedCharacters.filter((c) => c !== character);
            onCharactersChange(next.length === 0 ? ["all"] : next);
        } else {
            onCharactersChange([...selectedCharacters, character]);
        }
    };

    const handleBloodravenClick = () => {
        if (selectedCharacters.includes("bloodraven")) {
            onCharactersChange(["all"]);
        } else {
            onCharactersChange(["bloodraven"]);
        }
    };

    const getCharacterName = (character: string) => {
        return (
            nameMap[character] ||
            character.charAt(0).toUpperCase() + character.slice(1)
        );
    };

    if (mobile) {
        const renderLabel = () => {
            if (selectedCharacters.includes("all")) return t("charFilter.all");
            if (selectedCharacters.includes("various"))
                return t("charFilter.various");
            if (selectedCharacters.includes("bloodraven")) return "Bloodraven";
            const names = selectedCharacters.map((c) => getCharacterName(c));
            return names.length === 0 ? t("charFilter.all") : names.join(", ");
        };

        return (
            <div>
                <label className="text-xs font-medium text-muted-foreground">
                    {t("character")}
                </label>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-left text-xs flex items-center justify-between"
                        >
                            <span className="truncate">{renderLabel()}</span>
                            <ChevronDown className="w-4 h-4 ml-2 opacity-60" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle className="text-sm font-semibold">
                            {t("character")}
                        </DialogTitle>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                className={`px-2 py-1 rounded border text-xs w-full ${
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
                                className={`px-2 py-1 rounded border text-xs w-full ${
                                    selectedCharacters.includes("various")
                                        ? "bg-accent border-accent-foreground text-accent-foreground"
                                        : "bg-background border-border"
                                }`}
                                onClick={() => handleCharacterClick("various")}
                            >
                                {t("charFilter.various")}
                            </button>
                            <button
                                type="button"
                                className={`px-2 py-1 rounded border text-xs w-full col-span-2 ${
                                    selectedCharacters.includes("bloodraven")
                                        ? "bg-accent border-accent-foreground text-accent-foreground"
                                        : "bg-background border-border"
                                }`}
                                onClick={handleBloodravenClick}
                            >
                                {t("charFilter.bloodraven")}
                            </button>
                            {characters.map((character) => (
                                <button
                                    type="button"
                                    key={character}
                                    className={`px-2 py-1 rounded border text-xs w-full ${
                                        selectedCharacters.includes(character)
                                            ? "bg-accent border-accent-foreground text-accent-foreground"
                                            : "bg-background border-border"
                                    }`}
                                    onClick={() =>
                                        handleCharacterClick(character)
                                    }
                                >
                                    {getCharacterName(character)}
                                </button>
                            ))}
                        </div>

                        <DialogFooter className="mt-4">
                            <DialogClose asChild>
                                <Button size="sm" aria-label="Close">
                                    {tCommon("close")}
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
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
                <button
                    type="button"
                    className={`px-2 py-1 rounded border text-xs ${
                        selectedCharacters.includes("bloodraven")
                            ? "bg-accent border-accent-foreground text-accent-foreground"
                            : "bg-background border-border"
                    }`}
                    onClick={handleBloodravenClick}
                >
                    {t("charFilter.bloodraven")}
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
