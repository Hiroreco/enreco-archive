import { CHARACTER_ICON_MAP } from "@/components/view/fanart/FanartFilters";
import { Button } from "@enreco-archive/common-ui/components/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from "@enreco-archive/common-ui/components/dialog";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

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

                        <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[60vh]">
                            <button
                                type="button"
                                onClick={() => onCharactersChange(["all"])}
                                className={cn(
                                    "text-left px-3 py-2 rounded-lg text-sm transition-colors",
                                    "hover:bg-foreground/10 flex items-center gap-2",
                                    selectedCharacters.includes("all") &&
                                        "bg-foreground/20 font-semibold",
                                )}
                            >
                                <Image
                                    src={`images-opt/${CHARACTER_ICON_MAP["all"]}`}
                                    alt="all"
                                    width={25}
                                    height={25}
                                    className="rounded-md object-cover"
                                />
                                {t("charFilter.all")}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleCharacterClick("various")}
                                className={cn(
                                    "text-left px-3 py-2 rounded-lg text-sm transition-colors",
                                    "hover:bg-foreground/10 flex items-center gap-2",
                                    selectedCharacters.includes("various") &&
                                        "bg-foreground/20 font-semibold",
                                )}
                            >
                                <Image
                                    src={`images-opt/${CHARACTER_ICON_MAP["various"]}`}
                                    alt="various"
                                    width={25}
                                    height={25}
                                    className="rounded-md object-cover"
                                />
                                {t("charFilter.various")}
                            </button>
                            <button
                                type="button"
                                onClick={handleBloodravenClick}
                                className={cn(
                                    "text-left px-3 py-2 rounded-lg text-sm transition-colors",
                                    "hover:bg-foreground/10 flex items-center gap-2",
                                    selectedCharacters.includes("bloodraven") &&
                                        "bg-foreground/20 font-semibold",
                                )}
                            >
                                <Image
                                    src={`images-opt/${CHARACTER_ICON_MAP["bloodraven"]}`}
                                    alt="bloodraven"
                                    width={25}
                                    height={25}
                                    className="rounded-md object-cover"
                                />
                                {t("charFilter.bloodraven")}
                            </button>
                            {characters.map((character) => (
                                <button
                                    type="button"
                                    key={character}
                                    onClick={() =>
                                        handleCharacterClick(character)
                                    }
                                    className={cn(
                                        "text-left px-3 py-2 rounded-lg text-sm transition-colors",
                                        "hover:bg-foreground/10 flex items-center gap-2",
                                        selectedCharacters.includes(
                                            character,
                                        ) && "bg-foreground/20 font-semibold",
                                    )}
                                >
                                    <Image
                                        src={`images-opt/${CHARACTER_ICON_MAP[character]}`}
                                        alt={character}
                                        width={25}
                                        height={25}
                                        className="rounded-md object-cover"
                                    />
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
};

export default CharacterSelector;
