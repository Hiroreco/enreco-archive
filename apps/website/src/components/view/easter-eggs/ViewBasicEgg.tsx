import { useAudioStore } from "@/store/audioStore";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import Image from "next/image";
import { useState } from "react";

interface ViewBasicEggProps {
    sfxName: string;
    imageName: string;
    delayDuration: number;
    className?: string;
}

const ViewBasicEgg = ({
    sfxName,
    imageName,
    delayDuration,
    className = "",
}: ViewBasicEggProps) => {
    const { playSFX } = useAudioStore();
    const [canClick, setCanClick] = useState(true);

    return (
        <Image
            width={100}
            height={100}
            src={`images-opt/${imageName}-opt.webp`}
            className={cn(
                "transition-opacity absolute -bottom-[50px] right-0 h-[100px] w-auto",
                {
                    "cursor-pointer opacity-50 hover:opacity-100": canClick,
                    "opacity-100": !canClick,
                },
                className,
            )}
            alt={imageName}
            priority={true}
            onClick={() => {
                if (!canClick) return;
                playSFX("chicken-pop");
                setTimeout(() => {
                    playSFX(sfxName);
                }, 1000);
                setCanClick(false);
                setTimeout(() => {
                    setCanClick(true);
                }, delayDuration);
            }}
        />
    );
};

export default ViewBasicEgg;
