import { useAudioStore } from "@/store/audioStore";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState } from "react";

const AmeEasterEgg = () => {
    const audioStore = useAudioStore();
    const [phase, setPhase] = useState<"idle" | "clicked" | "run">("idle");

    const handleClick = () => {
        if (phase === "idle") {
            setPhase("clicked");
            audioStore.playSFX("chicken-pop");
            audioStore.playSFX("easter-ame");

            setTimeout(() => {
                setPhase("run");
            }, 2000);
        }
    };

    const variants = {
        idle: {},
        clicked: { x: 0, opacity: 1 },
        run: { x: 100, opacity: 0 },
    };

    return (
        <div
            onClick={handleClick}
            className="absolute -bottom-[20px] right-2 h-[120px] w-[100px] overflow-hidden"
        >
            <motion.div
                variants={variants}
                animate={phase}
                transition={{
                    duration: phase === "clicked" ? 0.2 : 1,
                    ease: "easeInOut",
                }}
            >
                <Image
                    width={100}
                    height={100}
                    src="images-opt/easter-ame-opt.webp"
                    className={cn(
                        "mx-auto transition-opacity translate-y-[50%]",
                        {
                            "cursor-pointer opacity-50 hover:opacity-100":
                                phase === "idle",
                        },
                    )}
                    alt="ame"
                    priority={true}
                />
            </motion.div>
        </div>
    );
};

export default AmeEasterEgg;
