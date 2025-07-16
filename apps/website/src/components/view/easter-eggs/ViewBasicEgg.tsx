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
        <>
            <Image
                width={100}
                height={100}
                src={`images-opt/${imageName}-opt.webp`}
                draggable={false}
                className={cn(
                    "transition-all select-none absolute -bottom-[70px] right-0 h-[100px] w-auto",
                    {
                        "cursor-pointer opacity-50 hover:opacity-80":
                            !isPlaying,
                        "opacity-80": isPlaying,
                    },
                    className,
                )}
                alt={imageName}
                priority={true}
                onClick={handleClick}
            />

            {isPlaying && (
                <div className="absolute -bottom-[50px] right-[10px] flex items-center gap-[1px] pointer-events-none">
                    <div
                        className="w-[2px] bg-white rounded-full animate-pulse"
                        style={{
                            height: "8px",
                            animationDelay: "0ms",
                            animationDuration: "600ms",
                        }}
                    />
                    <div
                        className="w-[2px] bg-white rounded-full animate-pulse"
                        style={{
                            height: "12px",
                            animationDelay: "200ms",
                            animationDuration: "600ms",
                        }}
                    />
                    <div
                        className="w-[2px] bg-white rounded-full animate-pulse"
                        style={{
                            height: "6px",
                            animationDelay: "400ms",
                            animationDuration: "600ms",
                        }}
                    />
                </div>
            )}
        </>
    );
};

export default ViewBasicEgg;
