import { cn } from "@/lib/utils";
import { useAudioStore } from "@/store/audioStore";
import Image from "next/image";
import { useState } from "react";

const ViewMoomEasterEgg = () => {
    const audioStore = useAudioStore();
    const [easterEggActivated, setEasterEggActivated] = useState(false);

    return (
        <div
            onClick={() => {
                if (!easterEggActivated) {
                    setEasterEggActivated(true);
                    audioStore.playSFX("moom");
                }
            }}
            className="absolute -bottom-12 right-2 h-[130px] overflow-hidden"
        >
            <Image
                width={100}
                height={100}
                src="images-opt/easter-moom.webp"
                className={cn("mx-auto transition-opacity translate-y-[50%]", {
                    "cursor-pointer opacity-50 hover:opacity-100":
                        !easterEggActivated,
                })}
                alt="moom"
            />
        </div>
    );
};

export default ViewMoomEasterEgg;
