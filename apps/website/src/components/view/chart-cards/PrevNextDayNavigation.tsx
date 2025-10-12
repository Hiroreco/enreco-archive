import { Button } from "@enreco-archive/common-ui/components/button";
import { useTranslations } from "next-intl";

interface PrevNextDayNavigationProps {
    onPreviousDayClick: () => void;
    onNextDayClick: () => void;
    disablePreviousDay?: boolean;
    disableNextDay?: boolean;
}

const PrevNextDayNavigation = ({
    onPreviousDayClick,
    onNextDayClick,
    disablePreviousDay,
    disableNextDay,
}: PrevNextDayNavigationProps) => {
    const t = useTranslations("cards");
    return (
        <div className="flex gap-2 justify-center w-full">
            <Button
                variant="outline"
                size="sm"
                onClick={onPreviousDayClick}
                disabled={disablePreviousDay}
            >
                {t("prevDay")}
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onNextDayClick}
                disabled={disableNextDay}
            >
                {t("nextDay")}
            </Button>
        </div>
    );
};

export default PrevNextDayNavigation;
