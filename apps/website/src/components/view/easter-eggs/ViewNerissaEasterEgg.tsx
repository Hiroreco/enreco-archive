import { cn } from "@enreco-archive/common-ui/lib/utils";
import { useAudioStore } from "@/store/audioStore";
import Image from "next/image";
import { useState } from "react";

const ViewNerissaEasterEgg = () => {
    const { playSFX } = useAudioStore();
    const [canClick, setCanClick] = useState(true);

    return (
        <div
            onClick={() => {
                if (!canClick) return;
                playSFX("sfx-chicken-pop");
                setTimeout(() => {
                    playSFX("easter-nerissa");
                }, 1000);
                setCanClick(false);
                setTimeout(() => {
                    setCanClick(true);
                }, 12000);
            }}
            className="absolute -bottom-[50px] right-2"
        >
            <Image
                width={100}
                height={100}
                src="images-opt/easter-nerissa-opt.webp"
                className={cn("transition-opacity", {
                    "cursor-pointer opacity-50 hover:opacity-100": canClick,
                    "opacity-100": !canClick,
                })}
                priority={true}
                alt="nerissa"
            />
        </div>
    );
};

export default ViewNerissaEasterEgg;
