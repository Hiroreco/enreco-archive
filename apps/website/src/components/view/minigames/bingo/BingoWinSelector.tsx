import useIsMobileViewport from "@/hooks/useIsMobileViewport";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { useTranslations } from "next-intl";

export type BingoWinStyle = "crack" | "outline" | "line" | "none"

export const BINGO_WIN_OPTIONS: BingoWinStyle[] = ["crack", "outline", "line", "none"];

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
    const t = useTranslations("modals.minigames.games.bingo");

    const isMobile = useIsMobileViewport();
    return (
        <Select
            value={value}
            onValueChange={(v) => onValueChange(v as BingoWinStyle)}
            disabled={disabled}
        >
            <SelectTrigger
                className={cn("flex-1 min-w-36", { "bg-blur": !isMobile })}
            >
                <SelectValue />
            </SelectTrigger>
            <SelectContent className={cn({ "bg-blur": !isMobile })}>
                {BINGO_WIN_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                        {t(`winOptionValues.${option}`)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default BingoWinSelector;
