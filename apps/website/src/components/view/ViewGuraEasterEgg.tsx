import { cn } from "@enreco-archive/common-ui/lib/utils";
import { useAudioStore } from "@/store/audioStore";
import Image from "next/image";
import { useState } from "react";

const ViewGuraEasterEgg = () => {
    const { playSFX } = useAudioStore();
    const [canClick, setCanClick] = useState(true);

    return (
        <div
            onClick={() => {
                if (!canClick) return;
                playSFX("sfx-chicken-pop");
                setTimeout(() => {
                    playSFX("easter-gura");
                }, 1000);
                setCanClick(false);
                setTimeout(() => {
                    setCanClick(true);
                }, 17000);
            }}
            className="absolute -bottom-[100px] right-2 h-[150px] overflow-hidden"
        >
            <Image
                width={100}
                height={100}
                src="images-opt/easter-gura-opt.webp"
                className={cn("transition-opacity", {
                    "cursor-pointer opacity-50 hover:opacity-100": canClick,
                    "opacity-100": !canClick,
                })}
                alt="gura"
            />
        </div>
    );
};

export default ViewGuraEasterEgg;
