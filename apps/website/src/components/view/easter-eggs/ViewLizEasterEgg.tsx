import { cn } from "@enreco-archive/common-ui/lib/utils";
import { useAudioStore } from "@/store/audioStore";
import Image from "next/image";

const ViewLizEasterEgg = () => {
    const audioStore = useAudioStore();
    return (
        <div
            onClick={() => {
                if (audioStore.isLizPlaying) return;
                audioStore.setIsLizPlaying(true);
                audioStore.playSFX("chicken-pop");
                setTimeout(() => {
                    audioStore.playSFX("easter-liz");
                }, 1000);
            }}
            className="absolute -bottom-12 right-2 h-[130px] overflow-hidden"
        >
            <Image
                width={100}
                height={100}
                src="images-opt/easter-gremliz-opt.webp"
                className={cn("mx-auto transition-opacity translate-y-[50%]", {
                    "cursor-pointer opacity-50 hover:opacity-100":
                        !audioStore.isLizPlaying,
                })}
                alt="liz"
                priority={true}
            />
        </div>
    );
};

export default ViewLizEasterEgg;
