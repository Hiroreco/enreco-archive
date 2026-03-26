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

export type BingoMarkerStyle =
    | "emblem"
    | "scarlet-wand"
    | "amber-coin"
    | "jade-sword"
    | "cerulean-cup";

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
    const t = useTranslations("modals.minigames.games.bingo");
    const isMobile = useIsMobileViewport();
    return (
        <Select
            value={value}
            onValueChange={(v) => onValueChange(v as BingoMarkerStyle)}
            disabled={disabled}
        >
            <SelectTrigger
                className={cn("flex-1 min-w-36", { "bg-blur": !isMobile })}
            >
                <SelectValue />
            </SelectTrigger>
            <SelectContent className={cn({ "bg-blur": !isMobile })}>
                {Object.entries(BINGO_MARKER_IMAGE_MAP).map(([key, src]) => (
                    <SelectItem key={key} value={key}>
                        {t(`markerOptionValues.${key}`)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default BingoMarkerSelector;
