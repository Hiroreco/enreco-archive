import { useAudioStore } from "@/store/audioStore";
import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState } from "react";

const ViewAmeEasterEgg = () => {
    const audioStore = useAudioStore();
    const [phase, setPhase] = useState<"idle" | "jump" | "run">("idle");

    const handleClick = () => {
        if (phase === "idle") {
            setPhase("jump");
            audioStore.playSFX("chicken-pop");
            audioStore.playSFX("ame");

            setTimeout(() => {
                setPhase("run");
            }, 2000);
        }
    };

    const variants = {
        idle: {},
        jump: {
            y: ["0px", "-20px", "0px"],
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
                duration: phase === "jump" ? 0.2 : 1,
                ease: "easeInOut",
            }}
            onClick={handleClick}
            className="absolute -bottom-[20px] right-2 h-[120px] overflow-hidden"
        >
            <Image
                width={100}
                height={100}
                src="images-opt/easter-ame.webp"
                className={clsx(
                    "mx-auto transition-opacity translate-y-[50%]",
                    {
                        "cursor-pointer opacity-50 hover:opacity-100":
                            phase === "idle",
                    },
                )}
                alt="ame"
            />
        </motion.div>
    );
};

export default ViewAmeEasterEgg;
