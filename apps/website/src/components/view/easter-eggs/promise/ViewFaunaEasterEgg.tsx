import { Button } from "@enreco-archive/common-ui/components/button";
import { useAudioStore } from "@/store/audioStore";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const ViewFaunaEasterEgg = () => {
    const [numbers, setNumbers] = useState([0, 0, 0]);
    const [spinningNumbers, setSpinningNumbers] = useState([0, 0, 0]);
    const [isRolling, setIsRolling] = useState(false);
    const [stoppedIndices, setStoppedIndices] = useState<number[]>([]);

    const {
        playSFX,
        playEasterEgg,
        initializeEasterEgg,
        cleanupEasterEgg,
        easterEggStates,
    } = useAudioStore();

    const eggState = easterEggStates["fauna"];
    const isEasterEggPlaying = eggState?.isPlaying || false;

    // Initialize easter egg on mount
    useEffect(() => {
        initializeEasterEgg("fauna");

        return () => {
            cleanupEasterEgg("fauna");
        };
    }, [initializeEasterEgg, cleanupEasterEgg]);

    // Rapid number updating effect while spinning
    useEffect(() => {
        if (!isRolling) return;

        const intervals = numbers.map((_, index) => {
            if (stoppedIndices.includes(index)) return null;

            return setInterval(() => {
                setSpinningNumbers((prev) => {
                    const next = [...prev];
                    next[index] = Math.floor(Math.random() * 10);
                    return next;
                });
            }, 50);
        });

        return () => {
            intervals.forEach(
                (interval) => interval && clearInterval(interval),
            );
        };
    }, [isRolling, stoppedIndices, numbers]);

    const handleRoll = () => {
        // Prevent rolling if already rolling or if easter egg audio is playing
        if (isRolling || isEasterEggPlaying) return;

        playSFX("click");

        setIsRolling(true);
        setStoppedIndices([]);
        setSpinningNumbers([0, 0, 0]);

        // Generate final random numbers
        const finalNumbers = [
            Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 10),
        ];
        setNumbers(finalNumbers);

        // Stop reels one by one
        [0, 1, 2].forEach((index) => {
            setTimeout(
                () => {
                    setStoppedIndices((prev) => [...prev, index]);
                    playSFX("xp");

                    // When the last reel stops, play the easter egg audio
                    if (index === 2) {
                        setIsRolling(false);

                        // Small delay before playing easter egg audio
                        playEasterEgg("fauna");
                    }
                },
                1000 + index * 500,
            );
        });
    };

    // Determine if button should be disabled
    const isButtonDisabled = isRolling || isEasterEggPlaying;

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2 border-red-100 overflow-hidden">
                {numbers.map((finalNum, index) => (
                    <motion.div
                        key={index}
                        className="w-12 h-16 relative flex items-center justify-center text-2xl font-bold rounded-md overflow-hidden"
                        animate={{
                            y:
                                isRolling && !stoppedIndices.includes(index)
                                    ? [20, -20]
                                    : 0,
                        }}
                        transition={{
                            duration: 0.1,
                            repeat:
                                isRolling && !stoppedIndices.includes(index)
                                    ? Infinity
                                    : 0,
                            ease: "linear",
                            delay: index * 0.05,
                        }}
                    >
                        <div className="absolute w-full h-[20%] top-0 bg-[#169c2b]" />
                        <div className="absolute w-full h-[60%] top-[20%] bg-white" />
                        <div className="absolute w-full h-[20%] bottom-0 bg-[#1f6f97]" />
                        <span className="z-10 text-[#229adc]">
                            {stoppedIndices.includes(index)
                                ? finalNum
                                : spinningNumbers[index]}
                        </span>
                    </motion.div>
                ))}
            </div>
            <Button
                onClick={handleRoll}
                disabled={isButtonDisabled}
                className={cn("w-24", {
                    "opacity-50 cursor-not-allowed": isButtonDisabled,
                })}
            >
                {isRolling ? "Rolling..." : "Roll"}
            </Button>
        </div>
    );
};

export default ViewFaunaEasterEgg;
