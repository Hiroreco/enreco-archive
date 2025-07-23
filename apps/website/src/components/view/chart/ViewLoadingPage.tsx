import { cn } from "@enreco-archive/common-ui/lib/utils";
import { motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
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

    const isAprilFools = useMemo(() => {
        const today = new Date();
        return today.getMonth() === 3 && today.getDate() === 1;
    }, []);

    const handleClick = useCallback(() => {
        if (!isAnimationComplete) return;
        setIsClicked(true);
        setViewAppVisible();
        setTimeout(onStart, 1000);
    }, [isAnimationComplete, setViewAppVisible, onStart]);

    const imageVariants = useMemo(
        () => ({
            hidden: {
                opacity: 0,
                filter: `blur(50px) brightness(${useDarkMode ? 0.5 : 2})`,
                scale: 1.05,
            },
            visible: {
                opacity: 1,
                filter: "blur(0px) brightness(1)",
                scale: 1,
                transition: {
                    opacity: {
                        duration: 3.5,
                        ease: "easeOut",
                    },
                    filter: {
                        duration: 3.5,
                        ease: [0.4, 0, 0.2, 1],
                        delay: 0.5,
                    },
                    scale: {
                        duration: 3.5,
                        ease: [0.25, 0.46, 0.45, 0.94],
                        delay: 0.5,
                    },
                },
            },
        }),
        [useDarkMode],
    );

    // Generate random star positions, always outside and drifting away from logo
    const stars = useMemo(() => {
        const numStars = 14;
        const logoCenterX = 50;
        const logoCenterY = 50;
        const logoRadius = 18 + (useDarkMode ? 8 : 0);
        const minDistance = logoRadius + 12; // minimum distance from logo edge
        const maxDistance = 48; // max distance from logo center
        return Array.from({ length: numStars }, (_, i) => {
            // Pick a random angle
            const angle = Math.random() * 2 * Math.PI;
            // Start outside the logo
            const startRadius = minDistance + Math.random() * (maxDistance - minDistance);
            const startX = logoCenterX + Math.cos(angle) * startRadius;
            const startY = logoCenterY + Math.sin(angle) * startRadius;
            // Drift further away from logo center (same angle, outward only)
            const driftDistance = 16 + Math.random() * 32;
            const endRadius = startRadius + driftDistance;
            const endX = logoCenterX + Math.cos(angle) * endRadius;
            const endY = logoCenterY + Math.sin(angle) * endRadius;
            return {
                id: i,
                startX,
                startY,
                endX,
                endY,
                delay: Math.random() * 1.5,
                duration: 2.5 + Math.random() * 2,
            };
        });
    }, [useDarkMode]);
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
                backgroundImage: "url('images-opt/bg-1-dark-opt.webp')",
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
                    backgroundImage: "url('images-opt/bg-1-opt.webp')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            />

            <div className="relative sm:h-[65vh] sm:max-h-[650px] w-auto">
                <motion.div
                    key={`logo-animation-${useDarkMode ? "dark" : "light"}`}
                    className="relative w-full h-full"
                    variants={imageVariants}
                    initial="hidden"
                    animate="visible"
                    onAnimationComplete={() => {
                        setIsAnimationComplete(true);
                    }}
                >
                    <Image
                        src={
                            isAprilFools
                                ? "/images-opt/bogos-opt.webp"
                                : "/images-opt/logo-1-opt.webp"
                        }
                        alt="ENreco Archive Logo"
                        width={600}
                        height={600}
                        priority
                        className="w-full h-full object-contain"
                    />
                </motion.div>

                {/* Twinkling stars */}
                {isAnimationComplete &&
                    isPulse &&
                    stars.map((star) => (
                        <motion.div
                            key={star.id}
                            className="absolute rounded-full"
                            style={{
                                width: '5px',
                                height: '5px',
                                background: 'linear-gradient(90deg, #7FDBFF 60%, #B3E5FC 100%)',
                                boxShadow: '0 0 8px 2px #7FDBFF, 0 0 12px 4px #B3E5FC',
                                pointerEvents: 'none',
                            }}
                            initial={{
                                opacity: 0,
                                scale: 0,
                                left: `${star.startX}%`,
                                top: `${star.startY}%`,
                            }}
                            animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0],
                                left: [`${star.startX}%`, `${star.endX}%`],
                                top: [`${star.startY}%`, `${star.endY}%`],
                            }}
                            transition={{
                                duration: star.duration,
                                delay: star.delay,
                                repeat: Infinity,
                                repeatDelay: 0.5,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
            </div>

            <motion.div
                className="mt-8 logo-text"
                variants={{
                    fadeIn: {
                        opacity: [0, 1],
                        transition: {
                            delay: 1,
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
                {isAprilFools ? (
                    <span className="text-center">
                        Sleep on that thang
                        <span className="block text-xs">
                            (happy april fools)
                        </span>
                    </span>
                ) : (
                    <span className="text-center">Click anywhere to start</span>
                )}
            </motion.div>
        </motion.div>
    );
};

export default ViewLoadingPage;
