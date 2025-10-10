import { Button } from "@enreco-archive/common-ui/components/button";

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
    return (
        <div className="flex gap-2 justify-center w-full">
            <Button
                variant="outline"
                size="sm"
                onClick={onPreviousDayClick}
                disabled={disablePreviousDay}
            >
                Previous Day
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onNextDayClick}
                disabled={disableNextDay}
            >
                Next Day
            </Button>
        </div>
    );
};

export default PrevNextDayNavigation;
