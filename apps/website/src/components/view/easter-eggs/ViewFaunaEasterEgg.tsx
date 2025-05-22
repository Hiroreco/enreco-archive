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

    const audioStore = useAudioStore();

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
        if (isRolling) return;

        audioStore.playSFX("click");

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
                    if (index === 2) {
                        setIsRolling(false);
                    }
                    audioStore.playSFX("xp");
                },
                1000 + index * 500,
            );
        });
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2 border-red-100 overflow-hidden">
                {numbers.map((finalNum, index) => (
                    <motion.div
                        key={index}
                        className={cn(
                            "w-12 h-16 relative flex items-center justify-center text-2xl font-bold rounded-md overflow-hidden",
                        )}
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
            <Button onClick={handleRoll} disabled={isRolling} className="w-24">
                {isRolling ? "Rolling..." : "Roll"}
            </Button>
        </div>
    );
};

export default ViewFaunaEasterEgg;
