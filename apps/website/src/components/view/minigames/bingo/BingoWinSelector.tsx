import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";

export type BingoWinStyle = "crack" | "outline" | "line";

export const BINGO_WIN_OPTIONS: {
    value: BingoWinStyle;
    label: string;
}[] = [
    { value: "crack", label: "Crack" },
    { value: "outline", label: "Outline" },
    { value: "line", label: "Line" },
];

interface BingoWinSelectorProps {
    value: BingoWinStyle;
    onValueChange: (value: BingoWinStyle) => void;
    disabled?: boolean;
}

const BingoWinSelector = ({
    value,
    onValueChange,
    disabled,
}: BingoWinSelectorProps) => {
    return (
        <Select
            value={value}
            onValueChange={(v) => onValueChange(v as BingoWinStyle)}
            disabled={disabled}
        >
            <SelectTrigger className="w-full min-w-28">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {BINGO_WIN_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default BingoWinSelector;
