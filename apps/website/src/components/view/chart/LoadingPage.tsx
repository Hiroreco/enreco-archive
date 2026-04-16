import { cn } from "@enreco-archive/common-ui/lib/utils";
import { motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface LoadingPageProps {
    useDarkMode: boolean;
    onStart: () => void;
    setViewAppVisible: () => void;
}

const LoadingPage = ({
    useDarkMode,
    onStart,
    setViewAppVisible,
}: LoadingPageProps) => {
    const t = useTranslations("loading");
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

    // Particles start scattered around the logo and converge toward center
    const particles = useMemo(() => {
        const numParticles = 18;
        return Array.from({ length: numParticles }, (_, i) => {
            const angle = (i / numParticles) * 2 * Math.PI;
            // Spread radius — how far out particles start (as % of container)
            const spreadRadius = 38 + Math.random() * 20;
            const startX = 50 + Math.cos(angle) * spreadRadius;
            const startY = 50 + Math.sin(angle) * spreadRadius;

            return {
                id: i,
                startX,
                startY,
                // All particles converge to logo center
                endX: 50,
                endY: 50,
                delay: Math.random() * 0.4, // stagger start
                duration: 0.8 + Math.random() * 0.4, // travel time
                size: 4 + Math.random() * 4, // px
                // Mix the brand colors
                color: i % 2 === 0 ? "#ec973a" : "#b83f22",
            };
        });
    }, []);

    const logoVariants = useMemo(
        () => ({
            hidden: {
                opacity: 0,
                filter: `blur(30px) brightness(${useDarkMode ? 0.5 : 2})`,
            },
            visible: {
                opacity: 1,
                filter: "blur(0px) brightness(1)",
                scale: 1,
                transition: {
                    opacity: {
                        delay: 1.2,
                        duration: 1.8,
                        ease: "easeOut",
                    },
                    filter: {
                        delay: 1.2,
                        duration: 1.8,
                        ease: [0.4, 0, 0.2, 1],
                    },

                },
            },
        }),
        [useDarkMode],
    );

    const stars = useMemo(() => {
        const numStars = 14;
        const logoCenterX = 50;
        const logoCenterY = 50;
        const logoRadius = 18 + (useDarkMode ? 8 : 0);
        const minDistance = logoRadius + 12;
        const maxDistance = 48;

        return Array.from({ length: numStars }, (_, i) => {
            const baseAngle = (i / numStars) * 2 * Math.PI;
            const angleVariation =
                (Math.random() - 0.5) * ((2 * Math.PI) / numStars) * 0.8;
            const angle = baseAngle + angleVariation;

            const startRadius =
                minDistance + Math.random() * (maxDistance - minDistance);
            const startX = logoCenterX + Math.cos(angle) * startRadius;
            const startY = logoCenterY + Math.sin(angle) * startRadius;

            const driftDistance = 16 + Math.random() * 32;
            const endRadius = startRadius + driftDistance;
            const endX = logoCenterX + Math.cos(angle) * endRadius;
            const endY = logoCenterY + Math.sin(angle) * endRadius;

            return {
                id: i,
                startX: Math.max(0, Math.min(100, startX)),
                startY: Math.max(0, Math.min(100, startY)),
                endX: Math.max(-20, Math.min(120, endX)),
                endY: Math.max(-20, Math.min(120, endY)),
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
                backgroundImage: "url('images-opt/bg-2-dark-opt.webp')",
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
                    backgroundImage: "url('images-opt/bg-2-opt.webp')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            />

            <div className="relative sm:h-[65vh] sm:max-h-[650px] w-auto">
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            width: p.size,
                            height: p.size,
                            background: p.color,
                            boxShadow: `0 0 6px 2px ${p.color}`,
                            translateX: "-50%",
                            translateY: "-50%",
                        }}
                        initial={{
                            opacity: 0,
                            left: `${p.startX}%`,
                            top: `${p.startY}%`,
                            scale: 1,
                        }}
                        animate={{
                            opacity: [0, 1, 1, 0],
                            left: [`${p.startX}%`, `${p.endX}%`],
                            top: [`${p.startY}%`, `${p.endY}%`],
                            scale: [1, 0.3],
                        }}
                        transition={{
                            duration: p.duration,
                            delay: p.delay,
                            ease: "easeIn",
                            // opacity keyframes timing
                            opacity: {
                                duration: p.duration,
                                delay: p.delay,
                                times: [0, 0.1, 0.7, 1],
                                ease: "easeIn",
                            },
                        }}
                    />
                ))}

                <motion.div
                    key={`logo-animation-${useDarkMode ? "dark" : "light"}`}
                    className="relative w-full h-full"
                    variants={logoVariants}
                    initial="hidden"
                    animate="visible"
                    onAnimationComplete={() => {
                        setIsAnimationComplete(true);
                    }}
                >
                    <Image
                        src={
                            isAprilFools
                                ? "/images-opt/april-fools-2026-opt.webp"
                                : "/images-opt/logo-2-opt.webp"
                        }
                        alt="ENreco Archive Logo"
                        width={600}
                        height={600}
                        priority
                        className="w-full h-full object-contain"
                    />
                </motion.div>

                {isAnimationComplete &&
                    isPulse &&
                    stars.map((star) => (
                        <motion.div
                            key={star.id}
                            className="absolute rounded-full"
                            style={{
                                width: "5px",
                                height: "5px",
                                background:
                                    "linear-gradient(90deg, #ec973a 60%, #b83f22 100%)",
                                boxShadow:
                                    "0 0 8px 2px #ec973a, 0 0 12px 4px #b83f22",
                                pointerEvents: "none",
                            }}
                            initial={{
                                opacity: 0,
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
                        {t("aprilFools.aprilFoolsMessage")}
                        <span className="block text-sm">
                            {t("aprilFools.aprilFoolsSubtext")}
                        </span>
                    </span>
                ) : (
                    <span className="text-center">{t("clickToStart")}</span>
                )}
            </motion.div>
        </motion.div>
    );
};

export default LoadingPage;
