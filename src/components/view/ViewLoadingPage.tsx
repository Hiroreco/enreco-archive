import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";

interface ViewLoadingPageProps {
    useDarkMode: boolean;
    onStart: () => void;
    setViewAppVisible: () => void;
}

const ViewLoadingPage = ({
    useDarkMode,
    onStart,
    setViewAppVisible,
}: ViewLoadingPageProps) => {
    const [isClicked, setIsClicked] = useState(false);
    const [isAnimationComplete, setIsAnimationComplete] = useState(false);
    const [isPulse, setIsPulse] = useState(false);

    const handleClick = () => {
        if (!isAnimationComplete) return;
        setIsClicked(true);
        setViewAppVisible();
        setTimeout(onStart, 1000);
    };

    const imageVariants = {
        hidden: {
            opacity: 0,
            clipPath: "circle(0% at 50% 50%)",
        },
        visible: {
            opacity: 1,
            clipPath: "circle(100% at 50% 50%)",
            transition: {
                clipPath: {
                    duration: 3.5,
                    ease: [0.4, 0, 0.2, 1],
                },
                opacity: {
                    duration: 4,
                    ease: "easeOut",
                },
            },
        },
    };

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: isClicked ? 0 : 1 }}
            transition={{ duration: 1 }}
            className={cn(
                "fixed inset-0 z-50 flex flex-col items-center justify-center",
                "cursor-pointer select-none",
                { "pointer-events-none": isClicked },
            )}
            style={{
                backgroundImage: "url('images-opt/bg-0-dark.webp')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
            onClick={handleClick}
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: useDarkMode ? 0 : 1 }}
                transition={{ duration: 0.5 }}
                className="absolute top-0 left-0 w-screen h-screen -z-10"
                style={{
                    backgroundImage: "url('images-opt/bg-0.webp')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            />

            <motion.div
                className="md:h-[60vh] md:max-h-[600px] w-auto relative"
                variants={imageVariants}
                initial="hidden"
                animate="visible"
                onAnimationComplete={() => {
                    setIsAnimationComplete(true);
                }}
            >
                <Image
                    src="/images-opt/logo.webp"
                    alt="ENreco Archive Logo"
                    width={600}
                    height={600}
                    priority
                    className="w-full h-full object-contain"
                />
            </motion.div>

            <motion.div
                className="mt-8 logo-text"
                variants={{
                    fadeIn: {
                        opacity: [0, 1],
                        transition: {
                            duration: 1,
                            ease: "easeOut",
                        },
                    },
                    pulse: {
                        opacity: [1, 0.3, 1],
                        transition: {
                            duration: 2,
                            times: [0, 0.5, 1],
                            repeat: Infinity,
                            repeatDelay: 0.5,
                        },
                    },
                }}
                initial={{ opacity: 0 }}
                animate={
                    isAnimationComplete ? (isPulse ? "pulse" : "fadeIn") : {}
                }
                onAnimationComplete={(definition) => {
                    if (definition === "fadeIn") {
                        setIsPulse(true);
                    }
                }}
            >
                Click anywhere to start
            </motion.div>
        </motion.div>
    );
};

export default ViewLoadingPage;
