import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import LogoSVG from "./LogoSVG";

interface ViewLoadingPageProps {
    onStart: () => void;
}

const ViewLoadingPage = ({ onStart }: ViewLoadingPageProps) => {
    const [isClicked, setIsClicked] = useState(false);
    const [isDrawingComplete, setIsDrawingComplete] = useState(false);

    const handleClick = () => {
        if (!isDrawingComplete) return;
        setIsClicked(true);
        setTimeout(onStart, 1000); // Wait for fade out animation
    };

    console.log(isDrawingComplete);

    const svgVariants = {
        hidden: {
            opacity: 1,
            pathLength: 0,
            fill: "rgba(255, 255, 255, 0)",
        },
        visible: {
            opacity: 1,
            pathLength: 1,
            fill: "rgba(255, 255, 255, 1)",
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
                "fixed inset-0 z-50 flex flex-col items-center justify-center bg-black",
                "cursor-pointer select-none",
                { "pointer-events-none": isClicked },
            )}
            // style={{
            //     backgroundImage: "url('bg.webp')",
            //     backgroundSize: "cover",
            //     backgroundPosition: "center",
            //     backgroundRepeat: "no-repeat",
            // }}
            onClick={handleClick}
        >
            <motion.div className="w-[400px] h-[400px] text-white">
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
                className="mt-8 text-white text-2xl font-semibold"
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
