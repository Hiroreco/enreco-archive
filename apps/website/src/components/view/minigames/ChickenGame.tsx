import { Button } from "@enreco-archive/common-ui/components/button";
import { useAudioStore } from "@/store/audioStore";
import { useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { LS_KEYS } from "@/lib/constants";

const BASKET_WIDTH = 60;
const BASKET_HEIGHT = 60;
const CHICKEN_SIZE = 30;
const CHICKEN_FALL_SPEED = 3;
const SPAWN_INTERVAL = 300;
const GAME_DURATION = 30;

interface Chicken {
    x: number;
    y: number;
    id: number;
}

const ViewChickenGame = () => {
    const t = useTranslations("modals.minigames.games.chicken");

    const audioStore = useAudioStore();
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [basketX, setBasketX] = useState(0);
    const [chickens, setChickens] = useState<Chicken[]>([]);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);

    const boardRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number>(0);
    const lastSpawnRef = useRef<number>(0);
    const chickenIdRef = useRef<number>(0);
    const timerRef = useRef<NodeJS.Timeout>(null);

    // Timer effect
    useEffect(() => {
        if (!isPlaying) return;

        timerRef.current = setInterval(() => {
            setTimeLeft((prev: number) => {
                if (prev <= 1) {
                    setIsPlaying(false);
                    audioStore.playSFX("xp");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isPlaying, audioStore]);

    // Update highscore
    useEffect(() => {
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem(LS_KEYS.CHICKEN_HS, score.toString());
        }
    }, [score, highScore]);

    // Initial highscore
    useEffect(() => {
        // Set basket to center
        setBasketX(boardRef.current!.clientWidth / 2 - BASKET_WIDTH / 2);
        setHighScore(
            parseInt(localStorage.getItem(LS_KEYS.CHICKEN_HS) || "0", 10),
        );
    }, []);

    const handleGameStart = () => {
        if (!isPlaying) {
            audioStore.playSFX("xp");
            setScore(0);
            setTimeLeft(GAME_DURATION);
            setChickens([]);
            setBasketX(boardRef.current!.clientWidth / 2 - BASKET_WIDTH / 2);
        } else {
            setHighScore((prev) => Math.max(prev, score));
        }
        setIsPlaying(!isPlaying);
    };

    // Handle mouse/touch movement
    useEffect(() => {
        if (!isPlaying) return;

        const handleMouseMove = (e: MouseEvent | TouchEvent) => {
            const board = boardRef.current;
            if (!board) return;

            const boardRect = board.getBoundingClientRect();
            const x =
                "touches" in e
                    ? e.touches[0].clientX - boardRect.left
                    : e.clientX - boardRect.left;

            setBasketX(
                Math.max(
                    0,
                    Math.min(
                        x - BASKET_WIDTH / 2,
                        boardRect.width - BASKET_WIDTH,
                    ),
                ),
            );
        };

        const board = boardRef.current;
        if (board) {
            if (isMobile) {
                board.addEventListener("touchmove", handleMouseMove);
            } else {
                board.addEventListener("mousemove", handleMouseMove);
            }
        }

        return () => {
            if (board) {
                if (isMobile) {
                    board.removeEventListener("touchmove", handleMouseMove);
                } else {
                    board.removeEventListener("mousemove", handleMouseMove);
                }
            }
        };
    }, [isPlaying]);

    // Game loop
    useEffect(() => {
        if (!isPlaying) return;

        const gameLoop = (timestamp: number) => {
            // Spawn new chickens
            if (
                timestamp - lastSpawnRef.current - Math.random() >
                SPAWN_INTERVAL
            ) {
                // Randomize chance to play sfx
                if (Math.random() < 0.3) {
                    audioStore.playSFX(
                        `chicken-${Math.floor(Math.random() * 3) + 1}`,
                    );
                }

                setChickens((prev) => [
                    ...prev,
                    {
                        x:
                            Math.random() *
                            (boardRef.current!.clientWidth - CHICKEN_SIZE),
                        y: -CHICKEN_SIZE,
                        id: chickenIdRef.current++,
                    },
                ]);
                lastSpawnRef.current = timestamp;
            }

            // Update chicken positions and check collisions
            setChickens((prev) => {
                const newChickens = prev
                    .filter((chicken) => {
                        // Check if chicken is caught
                        if (
                            chicken.y + CHICKEN_SIZE >
                                boardRef.current!.clientHeight -
                                    BASKET_HEIGHT &&
                            chicken.x + CHICKEN_SIZE > basketX &&
                            chicken.x < basketX + BASKET_WIDTH
                        ) {
                            audioStore.playSFX("chicken-pop");
                            setScore((s) => s + 1);
                            return false;
                        }
                        // Remove if fallen off screen
                        if (chicken.y > boardRef.current!.clientHeight) {
                            return false;
                        }
                        return true;
                    })
                    .map((chicken) => ({
                        ...chicken,
                        y: chicken.y + CHICKEN_FALL_SPEED,
                    }));
                return newChickens;
            });

            animationFrameRef.current = requestAnimationFrame(gameLoop);
        };

        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isPlaying, basketX, audioStore]);

    const isMobileDevice =
        typeof window !== "undefined" && window.innerWidth < 768;
    return (
        <div
            className={
                isMobileDevice
                    ? "flex flex-col w-[90%] h-[90%] items-center gap-2 text-sm md:text-base"
                    : "flex flex-col items-center gap-2 text-sm md:text-base w-full h-full p-2 box-border"
            }
            style={
                isMobileDevice
                    ? {}
                    : { maxWidth: 700, maxHeight: 550, margin: "0 auto" }
            }
        >
            <div className="w-full relative h-4 bg-gray-200 dark:bg-gray-600 rounded-lg mt-2 sm:mt-0">
                <div
                    className="absolute left-0 rounded-lg top-0 h-full transition-all bg-green-600 "
                    style={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }}
                />
            </div>
            <div
                ref={boardRef}
                className="relative grid-bg bg-gray-200 dark:bg-gray-600 overflow-hidden w-full h-full border-4"
                style={
                    isMobileDevice
                        ? {}
                        : { maxWidth: 600, maxHeight: 400, margin: "0 auto" }
                }
            >
                {/* Chickens */}
                {chickens.map((chicken) => (
                    <Image
                        key={chicken.id}
                        className="absolute"
                        style={{
                            left: chicken.x,
                            top: chicken.y,
                            width: CHICKEN_SIZE,
                            height: CHICKEN_SIZE,
                        }}
                        width={50}
                        height={50}
                        src={`/images-opt/chicken-opt.webp`}
                        alt="chicken"
                    ></Image>
                ))}

                {/* Basket */}
                <Image
                    className="absolute bottom-0 text-center"
                    style={{
                        left: basketX,
                        width: BASKET_WIDTH,
                        height: BASKET_HEIGHT,
                    }}
                    width={60}
                    height={60}
                    src={`/images-opt/basket-opt.webp`}
                    alt="basket"
                ></Image>
            </div>
            <div className="flex w-full items-center justify-around sm:mb-2">
                <span className="w-24 text-center">
                    {t("score")}: {score}
                </span>
                <span className="w-32 text-center">
                    {t("highScore")}: {highScore}
                </span>
                <Button
                    className="w-20"
                    onClick={
                        isPlaying ? () => setIsPlaying(false) : handleGameStart
                    }
                >
                    {isPlaying ? t("stop") : t("start")}
                </Button>
            </div>
        </div>
    );
};

export default ViewChickenGame;
