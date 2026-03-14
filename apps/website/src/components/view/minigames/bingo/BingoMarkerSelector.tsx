import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";

export type BingoMarkerStyle =
    | "emblem"
    | "scarlet-wand"
    | "amber-coin"
    | "jade-sword"
    | "cerulean-cup";

export const BINGO_MARKER_OPTIONS: {
    value: BingoMarkerStyle;
    label: string;
}[] = [
    { value: "emblem", label: "Emblem" },
    { value: "scarlet-wand", label: "Scarlet Wand" },
    { value: "amber-coin", label: "Amber Coin" },
    { value: "jade-sword", label: "Jade Sword" },
    { value: "cerulean-cup", label: "Cerulean Cup" },
];

export const BINGO_MARKER_IMAGE_MAP: Record<BingoMarkerStyle, string> = {
    emblem: "images-opt/emblem-opt.webp",
    "scarlet-wand": "images-opt/scarletwand-opt.webp",
    "amber-coin": "images-opt/ambercoin-opt.webp",
    "jade-sword": "images-opt/jadesword-opt.webp",
    "cerulean-cup": "images-opt/ceruleancup-opt.webp",
};

interface BingoMarkerSelectorProps {
    value: BingoMarkerStyle;
    onValueChange: (value: BingoMarkerStyle) => void;
    disabled?: boolean;
}

const BingoMarkerSelector = ({
    value,
    onValueChange,
    disabled,
}: BingoMarkerSelectorProps) => {
    return (
        <Select
            value={value}
            onValueChange={(v) => onValueChange(v as BingoMarkerStyle)}
            disabled={disabled}
        >
            <SelectTrigger className="w-full min-w-36">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {BINGO_MARKER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default BingoMarkerSelector;
