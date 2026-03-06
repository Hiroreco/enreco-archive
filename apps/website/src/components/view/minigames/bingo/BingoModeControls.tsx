import { Button } from "@enreco-archive/common-ui/components/button";
import { CheckSquare, Edit } from "lucide-react";
import { useTranslations } from "next-intl";

interface BingoModeControlsProps {
    isEditMode: boolean;
    onModeChange: (isEditMode: boolean) => void;
    disabled?: boolean;
}

const BingoModeControls = ({
    isEditMode,
    onModeChange,
    disabled,
}: BingoModeControlsProps) => {
    const t = useTranslations("modals.minigames.games.bingo");

    return (
        <div className="flex gap-1">
            <Button
                size="sm"
                variant={isEditMode ? "default" : "outline"}
                onClick={() => onModeChange(true)}
                title={t("editMode")}
                disabled={disabled}
            >
                <Edit className="size-4 mr-1" />
                {t("edit")}
            </Button>
            <Button
                size="sm"
                variant={!isEditMode ? "default" : "outline"}
                onClick={() => onModeChange(false)}
                title={t("markMode")}
                disabled={disabled}
            >
                <CheckSquare className="size-4 mr-1" />
                {t("play")}
            </Button>
        </div>
    );
};

export default BingoModeControls;
