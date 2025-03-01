import { useAudioStore } from "@/store/audioStore";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState } from "react";

const ViewPotatoSalidEasterEgg = () => {
    const audioStore = useAudioStore();
    const [jump, setJump] = useState(false);
    return (
        <motion.div
            animate={jump ? { y: ["0px", "-20px", "0px"] } : {}}
            transition={{ duration: 0.2 }}
            onClick={() => {
                if (audioStore.currentBgmKey !== "/audio/potato.mp3") {
                    setJump(true);
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
                        audioStore.currentBgmKey !== "/audio/potato.mp3",
                })}
                alt="potato salid"
            />
        </motion.div>
    );
};

export default ViewPotatoSalidEasterEgg;
