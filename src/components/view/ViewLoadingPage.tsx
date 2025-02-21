import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import LogoSVG from "./LogoSVG";

interface ViewLoadingPageProps {
    useDarkMode: boolean,
    onStart: () => void;
    setViewAppVisible: () => void;
}

const ViewLoadingPage = ({
    useDarkMode,
    onStart,
    setViewAppVisible,
}: ViewLoadingPageProps) => {
    const [isClicked, setIsClicked] = useState(false);
    const [isDrawingComplete, setIsDrawingComplete] = useState(false);

    const handleClick = () => {
        if (!isDrawingComplete) return;
        setIsClicked(true);
        // Set the visibility before the fade out
        setViewAppVisible();
        setTimeout(onStart, 1000);
    };

    const svgVariants = {
        hidden: {
            opacity: 1,
            pathLength: 0,
            fill: "rgba(255, 255, 255, 0)",
        },
        visible: {
            opacity: 1,
            pathLength: 1,
            fill: "rgba(111, 156, 192, 1)",
            transition: {
                duration: 2,
                ease: "easeInOut",
                pathLength: {
                    duration: 2,
                    ease: "easeInOut",
                },
                fill: {
                    duration: 0.5,
                    delay: 2, // Start fill animation after path drawing
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
                backgroundImage: `url('bg-dark.png')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                transition: "background-image 500ms linear"
            }}
            onClick={handleClick}
        >
            <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: useDarkMode ? 0 : 1}}
                className="rounded-none absolute z-[-10] h-screen w-screen"
                src="bg.webp"
            />

            <motion.div className="md:h-[60vh] md:max-h-[600px] md:w-auto w-[400px] h-[400px] text-[#6f9cc0] mr-2">
                <LogoSVG
                    onAnimationComplete={() => {
                        setTimeout(() => setIsDrawingComplete(true), 3000);
                    }}
                    className="w-full h-full"
                    variants={svgVariants}
                    initial="hidden"
                    animate="visible"
                />
            </motion.div>
            <motion.div
                className="mt-8 text-[#6f9cc0] text-2xl font-semibold"
                initial={{ opacity: 0 }}
                transition={{
                    duration: 0.5,
                }}
                variants={{
                    visible: {
                        opacity: [0.3, 1, 0.3],
                        transition: {
                            duration: 2,
                            times: [0, 0.5, 1],
                            repeat: Infinity,
                            repeatDelay: 1,
                        },
                    },
                }}
                animate={isDrawingComplete ? "visible" : "hidden"}
            >
                Click anywhere to start
            </motion.div>
        </motion.div>
    );
};

export default ViewLoadingPage;
