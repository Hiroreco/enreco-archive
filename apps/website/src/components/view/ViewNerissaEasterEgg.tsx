import { cn } from "@enreco-archive/common-ui/lib/utils";
import { useAudioStore } from "@/store/audioStore";
import Image from "next/image";

const ViewAwooEasterEgg = () => {
    const { playSFX } = useAudioStore();

    return (
        <div
            onClick={() => {
                setTimeout(() => {
                    playSFX("nerissa-sfx");
                }, 1000);
            }}
            className="absolute -bottom-[24px] right-2 h-[150px] overflow-hidden"
        >
            <Image
                width={100}
                height={100}
                src="images-opt/easter-nerissa.webp"
                className={cn(
                    " cursor-pointer opacity-50 hover:opacity-100 transition-opacity translate-y-[50%]",
                )}
                alt="awoo"
            />
        </div>
    );
};

export default ViewAwooEasterEgg;
