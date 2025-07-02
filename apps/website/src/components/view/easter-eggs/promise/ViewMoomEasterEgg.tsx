import { cn } from "@enreco-archive/common-ui/lib/utils";
import { useAudioStore } from "@/store/audioStore";
import Image from "next/image";

const ViewMoomEasterEgg = () => {
    const audioStore = useAudioStore();

    return (
        <div
            onClick={() => {
                if (audioStore.isMoomPlaying) return;
                audioStore.setIsMoomPlaying(true);
                audioStore.playSFX("chicken-pop");
                setTimeout(() => {
                    audioStore.playSFX("easter-moom");
                }, 1000);
            }}
            className="absolute -bottom-[24px] right-2 h-[150px] overflow-hidden"
        >
            <Image
                width={100}
                height={100}
                src="images-opt/easter-moom-opt.webp"
                className={cn("mx-auto transition-opacity translate-y-[50%]", {
                    "cursor-pointer opacity-50 hover:opacity-100":
                        !audioStore.isMoomPlaying,
                })}
                alt="moom"
            />
        </div>
    );
};

export default ViewMoomEasterEgg;
