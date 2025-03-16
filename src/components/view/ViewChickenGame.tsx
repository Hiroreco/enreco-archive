import { Button } from "@/components/ui/button";
import { LS_CHICKEN_HS } from "@/lib/constants";
import { useAudioStore } from "@/store/audioStore";
import { useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";

import Image from "next/image";

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
    const audioStore = useAudioStore();
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [basketX, setBasketX] = useState(0);
    const [chickens, setChickens] = useState<Chicken[]>([]);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);

    const boardRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number>();
    const lastSpawnRef = useRef<number>(0);
    const chickenIdRef = useRef<number>(0);
    const timerRef = useRef<NodeJS.Timeout>();

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
            localStorage.setItem(LS_CHICKEN_HS, score.toString());
        }
    }, [score, highScore]);

    // Initial highscore
    useEffect(() => {
        // Set basket to center
        setBasketX(boardRef.current!.clientWidth / 2 - BASKET_WIDTH / 2);
        setHighScore(parseInt(localStorage.getItem(LS_CHICKEN_HS) || "0", 10));
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

    return (
        <div className="flex flex-col w-[90%] h-[90%] items-center gap-2 text-sm md:text-base">
            <div className="w-full relative h-4 bg-gray-200 dark:bg-gray-600 rounded-lg mt-2 sm:mt-0">
                <div
                    className="absolute left-0 rounded-lg top-0 h-full transition-all bg-green-600 "
                    style={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }}
                />
            </div>
            <div
                ref={boardRef}
                className="relative grid-bg bg-gray-200 dark:bg-gray-600 overflow-hidden w-full h-full border-4"
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
                        src={`/images-opt/chicken.webp`}
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
                    src={`/images-opt/basket.webp`}
                    alt="basket"
                ></Image>
            </div>
            <div className="flex w-full items-center justify-around sm:mb-2">
                <span className="w-24 text-center">Score: {score}</span>
                <span className="w-32 text-center">
                    High Score: {highScore}
                </span>
                <Button
                    className="w-20"
                    onClick={
                        isPlaying ? () => setIsPlaying(false) : handleGameStart
                    }
                >
                    {isPlaying ? "Stop" : "Start"}
                </Button>
            </div>
        </div>
    );
};

export default ViewChickenGame;
