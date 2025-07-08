import { useAudioStore } from "@/store/audioStore";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import Image from "next/image";
import { useEffect } from "react";

interface ViewBasicEggProps {
    eggName: string;
    imageName: string;
    className?: string;
}

const ViewBasicEgg = ({
    eggName,
    imageName,
    className = "",
}: ViewBasicEggProps) => {
    const {
        playEasterEgg,
        initializeEasterEgg,
        cleanupEasterEgg,
        easterEggStates,
    } = useAudioStore();

    const eggState = easterEggStates[eggName];
    const isPlaying = eggState?.isPlaying || false;

    useEffect(() => {
        initializeEasterEgg(eggName);

        return () => {
            cleanupEasterEgg(eggName);
        };
    }, [eggName, initializeEasterEgg, cleanupEasterEgg]);

    const handleClick = () => {
        if (!isPlaying) {
            playEasterEgg(eggName);
        }
    };

    return (
        <Image
            width={100}
            height={100}
            src={`images-opt/${imageName}-opt.webp`}
            className={cn(
                "transition-all absolute -bottom-[50px] right-0 h-[100px] w-auto",
                {
                    "cursor-pointer opacity-50 hover:opacity-100": !isPlaying,
                    "opacity-100 scale-105": isPlaying,
                },
                className,
            )}
            alt={imageName}
            priority={true}
            onClick={handleClick}
        />
    );
};

export default ViewBasicEgg;
