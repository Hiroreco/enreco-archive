import { cn } from "@/lib/utils";
import { useAudioStore } from "@/store/audioStore";
import Image from "next/image";

const ViewPotatoSalidEasterEgg = () => {
    const audioStore = useAudioStore();
    const isCurrentlyPotatoSalid =
        audioStore.currentBgmKey === "/audio/potato.mp3";
    return (
        <div
            onClick={() => {
                if (!isCurrentlyPotatoSalid) {
                    audioStore.playSFX("chicken-pop");
                    audioStore.changeBGM("/audio/potato.mp3");
                }
            }}
            className="absolute -bottom-12 right-2 h-[130px] overflow-hidden"
        >
            <Image
                width={100}
                height={100}
                src="images-opt/easter-gremliz.webp"
                className={cn("mx-auto transition-opacity translate-y-[50%]", {
                    "cursor-pointer opacity-50 hover:opacity-100":
                        !isCurrentlyPotatoSalid,
                })}
                alt="potato salid"
            />
        </div>
    );
};

export default ViewPotatoSalidEasterEgg;
