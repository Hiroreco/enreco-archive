import { cn } from "@enreco-archive/common-ui/lib/utils";
import { useAudioStore } from "@/store/audioStore";
import Image from "next/image";
import { useState, useEffect } from "react";
import { LS_AWOO_EASTER_EGG_COUNT } from "@/lib/constants";

const ViewAwooEasterEgg = () => {
    const { playSFX } = useAudioStore();
    const [clickCount, setClickCount] = useState<number>(0);
    const [isHovered, setIsHovered] = useState<boolean>(false);

    useEffect(() => {
        const savedCount = localStorage.getItem(LS_AWOO_EASTER_EGG_COUNT);
        if (savedCount) {
            setClickCount(parseInt(savedCount, 10));
        }
    }, []);

    const handleClick = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);

        localStorage.setItem(LS_AWOO_EASTER_EGG_COUNT, newCount.toString());

        playSFX("easter-awoo");
    };

    return (
        <div className="absolute -bottom-[50px] right-2 h-[150px] overflow-hidden">
            {clickCount > 0 && (
                <div
                    className={cn(
                        "absolute left-[16px] top-[36px] z-10 text-white px-2 py-1 rounded-full text-sm font-bold min-w-[24px] text-center transition-colors",
                        isHovered ? "bg-black/70" : "bg-black/40",
                    )}
                >
                    {clickCount}
                </div>
            )}

            <Image
                width={100}
                height={100}
                src="images-opt/easter-gigi-opt.webp"
                className={cn(
                    "cursor-pointer opacity-50 hover:opacity-100 transition-opacity translate-y-[50%]",
                )}
                alt="awoo"
                onClick={handleClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            />
        </div>
    );
};

export default ViewAwooEasterEgg;
