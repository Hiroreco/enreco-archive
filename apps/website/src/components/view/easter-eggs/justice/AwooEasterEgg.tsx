import { cn } from "@enreco-archive/common-ui/lib/utils";
import { useAudioStore } from "@/store/audioStore";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { LS_KEYS } from "@/lib/constants";

const ViewAwooEasterEgg = () => {
    const { playSFX } = useAudioStore();
    const [clickCount, setClickCount] = useState<number>(0);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const lastClickTime = useRef<number>(0);
    const clicksThisSecond = useRef<number>(0);
    const clickSecondTimer = useRef<NodeJS.Timeout | null>(null);

    const MAX_CLICKS = 10000;
    const MAX_CLICKS_PER_SECOND = 30;

    useEffect(() => {
        const savedCount = localStorage.getItem(LS_KEYS.AWOO_EASTER_EGG_COUNT);
        if (savedCount) {
            setClickCount(Math.min(parseInt(savedCount, 10), MAX_CLICKS));
        }
    }, []);

    const handleClick = () => {
        const now = Date.now();
        const timeSinceLastClick = now - lastClickTime.current;

        if (timeSinceLastClick >= 1000) {
            clicksThisSecond.current = 0;
        }

        if (clicksThisSecond.current >= MAX_CLICKS_PER_SECOND) {
            return;
        }

        clicksThisSecond.current++;
        lastClickTime.current = now;

        if (clickSecondTimer.current) {
            clearTimeout(clickSecondTimer.current);
        }
        clickSecondTimer.current = setTimeout(() => {
            clicksThisSecond.current = 0;
        }, 1000);

        if (clickCount < MAX_CLICKS) {
            const newCount = Math.min(clickCount + 1, MAX_CLICKS);
            setClickCount(newCount);

            localStorage.setItem(
                LS_KEYS.AWOO_EASTER_EGG_COUNT,
                newCount.toString(),
            );
        }

        playSFX("easter-awoo");
    };

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (clickSecondTimer.current) {
                clearTimeout(clickSecondTimer.current);
            }
        };
    }, []);

    return (
        <div className="absolute -bottom-[50px] right-2 h-[150px] overflow-hidden">
            {clickCount > 0 && (
                <div
                    className={cn(
                        "absolute left-[16px] top-[36px] z-10 text-white px-2 py-1 rounded-full text-sm font-bold min-w-[24px] text-center transition-colors",
                        isHovered ? "bg-black/70" : "bg-black/40",
                    )}
                >
                    {clickCount >= MAX_CLICKS ? "Overwoo!" : clickCount}
                </div>
            )}

            <Image
                width={100}
                height={100}
                src="images-opt/easter-gigi-opt.webp"
                className={cn(
                    "cursor-pointer opacity-50 hover:opacity-100 transition-opacity translate-y-[50%]",
                    clickCount >= MAX_CLICKS &&
                        "cursor-not-allowed opacity-30 hover:opacity-30",
                )}
                alt="awoo"
                onClick={handleClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                priority={true}
            />
        </div>
    );
};

export default ViewAwooEasterEgg;
