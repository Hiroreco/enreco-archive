import { Button } from "@enreco-archive/common-ui/components/button";
import { Check, RotateCcw, Shuffle, Sparkles, X } from "lucide-react";
import { useTranslations } from "next-intl";

type PreviewMode = "none" | "preset" | "randomize";

interface BingoPreviewModeControlsProps {
    previewMode: PreviewMode;
    onRandomize: () => void;
    onPreset: () => void;
    onReroll: () => void;
    onAccept: () => void;
    onCancel: () => void;
    isBoardEmpty: boolean;
    compact?: boolean;
}

const BingoPreviewModeControls = ({
    previewMode,
    onRandomize,
    onPreset,
    onReroll,
    onAccept,
    onCancel,
    isBoardEmpty,
    compact,
}: BingoPreviewModeControlsProps) => {
    const t = useTranslations("modals.minigames.games.bingo");

    if (previewMode === "none") {
        return (
            <>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onRandomize}
                    title={t("randomize")}
                    disabled={isBoardEmpty}
                    className="gap-1"
                >
                    <Shuffle className="size-4" />
                    {t("randomize")}
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onPreset}
                    title={t("preset")}
                    className="gap-1"
                >
                    <Sparkles className="size-4" />
                    {t("preset")}
                </Button>
            </>
        );
    }

    return (
        <>
            <Button
                size="sm"
                variant="outline"
                onClick={onReroll}
                className="gap-1"
            >
                <RotateCcw className={"size-4"} />
                {t("reroll")}
            </Button>
            <Button
                size="sm"
                variant="default"
                onClick={onAccept}
                className="gap-1"
            >
                <Check className={"size-4"} />
                {!compact && t("accept")}
            </Button>
            <Button
                size="sm"
                variant="destructive"
                onClick={onCancel}
                className="gap-1"
            >
                <X className={"size-4"} />
                {!compact && t("cancel")}
            </Button>
        </>
    );
};

export default BingoPreviewModeControls;
