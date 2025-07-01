import { useAudioStore } from "@/store/audioStore";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState } from "react";

const ViewAmeEasterEgg = () => {
    const audioStore = useAudioStore();
    const [phase, setPhase] = useState<"idle" | "clicked" | "run">("idle");

    const handleClick = () => {
        if (phase === "idle") {
            setPhase("clicked");
            audioStore.playSFX("sfx-chicken-pop");
            audioStore.playSFX("easter-ame");

            setTimeout(() => {
                setPhase("run");
            }, 2000);
        }
    };

    const variants = {
        idle: {},
        clicked: {
            opacity: 1,
        },
        run: {
            x: ["0px", "200px"],
            opacity: [1, 0],
        },
    };

    return (
        <motion.div
            variants={variants}
            animate={phase}
            transition={{
                duration: phase === "clicked" ? 0.2 : 1,
                ease: "easeInOut",
            }}
            onClick={handleClick}
            className="absolute -bottom-[20px] right-2 h-[120px] overflow-hidden"
        >
            <Image
                width={100}
                height={100}
                src="images-opt/easter-ame-opt.webp"
                className={cn("mx-auto transition-opacity translate-y-[50%]", {
                    "cursor-pointer opacity-50 hover:opacity-100":
                        phase === "idle",
                })}
                alt="ame"
                priority={true}
            />
        </motion.div>
    );
};

export default ViewAmeEasterEgg;
