import { useAudioStore } from "@/store/audioStore";
import clsx from "clsx";
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
                setJump(true);
                audioStore.playSFX("chicken-pop");
                audioStore.changeBGM("potato");
            }}
            className="absolute bottom-0 right-2 h-[130px] overflow-hidden"
        >
            <Image
                width={100}
                height={100}
                src="images/original-optimized/easter-gremliz.webp"
                className={clsx(
                    "mx-auto transition-opacity translate-y-[50%]",
                    {
                        "cursor-pointer opacity-50 hover:opacity-100":
                            audioStore.currentBgmKey !== "potato",
                    },
                )}
                alt="potato salid"
            />
        </motion.div>
    );
};

export default ViewPotatoSalidEasterEgg;
