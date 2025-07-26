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
        return (
            <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">
                    Characters
                </label>
                <div className="overflow-x-auto scrollbar-hide">
                    <div
                        className="grid gap-1 min-w-max"
                        style={{
                            gridTemplateRows: "repeat(2, minmax(0, 1fr))",
                            gridAutoFlow: "column",
                            gridAutoColumns: "max-content",
                        }}
                    >
                        <button
                            type="button"
                            className={`px-2 py-1 rounded border text-xs whitespace-nowrap flex-shrink-0 ${
                                selectedCharacters.includes("all")
                                    ? "bg-accent border-accent-foreground text-accent-foreground"
                                    : "bg-background border-border"
                            }`}
                            onClick={() => onCharactersChange(["all"])}
                        >
                            All
                        </button>
                        <button
                            type="button"
                            className={`px-2 py-1 rounded border text-xs whitespace-nowrap flex-shrink-0 ${
                                selectedCharacters.includes("various")
                                    ? "bg-accent border-accent-foreground text-accent-foreground"
                                    : "bg-background border-border"
                            }`}
                            onClick={() => handleCharacterClick("various")}
                        >
                            Various
                        </button>
                        {characters.map((character) => (
                            <button
                                type="button"
                                key={character}
                                className={`px-2 py-1 rounded border text-xs whitespace-nowrap flex-shrink-0 ${
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
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Character:</label>
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
                    All
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
                    Various
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
