import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

interface ViewProgressBarProps {
    day: number;
    numberOfDays: number;
}

interface ViewProgressBarProps {
    numberOfDays: number;
    day: number;
    onDayChange: (newDay: number) => void;
}

const Progress = ({ numberOfDays, day, onDayChange }: ViewProgressBarProps) => {
    // Add 2 invisible points to the start and end of the progress bar
    const numberOfDaysWithTwoInvisiblePoints = numberOfDays + 2;
    const [width, setWidth] = useState("0%");
    const pointRefs = useRef<HTMLDivElement[]>([]);

    // Calculate the width based on the current active point
    useEffect(() => {
        // If last day, set width to 100%
        if (day === numberOfDays - 1) {
            setWidth("100%");
            return;
        }
        const activePointRef = pointRefs.current[day + 1];
        if (activePointRef) {
            const rect = activePointRef.getBoundingClientRect();
            const parentRect =
                activePointRef.parentElement?.getBoundingClientRect();
            if (parentRect) {
                const percentage =
                    ((rect.left - parentRect.left) / parentRect.width) * 100;
                setWidth(`${percentage}%`);
            }
        }
    }, [day, numberOfDays]);

    return (
        <div className="relative w-full m-auto transition-opacity flex-none bg-neutral-200 dark:bg-neutral-500 rounded-lg h-[4px] opacity-50 hover:opacity-100">
            <div
                className="absolute left-0 top-0 transition-all duration-1000 h-[4px] rounded-lg bg-accent"
                style={{
                    width: width,
                }}
            ></div>
            {Array.from({ length: numberOfDaysWithTwoInvisiblePoints }).map(
                (_, index) => (
                    <div
                        ref={(el) => {
                            if (el) pointRefs.current[index] = el;
                        }}
                        key={index}
                        className={clsx(
                            "w-[12px] h-[12px] transition-colors duration-1000 rounded-sm absolute -translate-y-[4px] -translate-x-[6px] hover:bg-accent cursor-pointer",
                            {
                                "bg-accent": index - 1 <= day,
                                "dark:bg-neutral-600 bg-neutral-300":
                                    index - 1 > day,
                                "invisible pointer-events-none":
                                    index === 0 ||
                                    index ===
                                        numberOfDaysWithTwoInvisiblePoints - 1,
                            },
                        )}
                        style={{
                            left: `${
                                (index /
                                    (numberOfDaysWithTwoInvisiblePoints - 1)) *
                                100
                            }%`,
                        }}
                        onClick={() => {
                            onDayChange(index - 1);
                        }}
                    />
                ),
            )}
        </div>
    );
};

export default Progress;
