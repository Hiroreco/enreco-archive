import { Button } from "@/components/ui/button";
import { LS_MEMORY_HS } from "@/lib/constants";
import { useAudioStore } from "@/store/audioStore";
import clsx from "clsx";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";

const COLOR_MAP: { [key: number]: string } = {
    [-1]: "box-empty",
    0: "box-red",
    1: "box-green",
    2: "box-blue",
    3: "box-yellow",
};

const SHORTCUT_KEYS = {
    "1": 0,
    "2": 1,
    "3": 2,
    "4": 3,
};

const INITIAL_TIME = 60;

const initBoardState = (boardSize: number) => {
    return Array.from({ length: boardSize }, () => -1);
};

type GuessState = "correct" | "incorrect" | "none";

const ViewMemoryGame = () => {
    const sideLength = 5;
    const audioStore = useAudioStore();
    // Game states
    const [board, setBoard] = useState(initBoardState(sideLength * sideLength));
    const [difficulty, setDifficulty] = useState(2);
    const [chosenValue, setChosenValue] = useState(0);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
    const [allowClick, setAllowClick] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [guessState, setGuessState] = useState<GuessState>("none");

    const intervalRef = useRef<NodeJS.Timeout>();

    const getNumberOfUnsolvedSlots = (board: number[]) => {
        return board.filter((value) => value >= 4).length;
    };

    // Get difficulty based on current score
    const calculateDifficulty = (score: number) => {
        return Math.min(Math.floor(score / 5) + 2, sideLength * sideLength);
    };

    const handleBoardClick = (index: number) => {
        if (board[index] !== -1 && board[index] < 4) {
            return;
        }

        if (!isPlaying) {
            return;
        }

        if (!allowClick) {
            return;
        }

        let newScore = score;

        if (chosenValue !== -1 && chosenValue + 4 === board[index]) {
            // Final slot solved, so we're updating the difficulty and the board
            audioStore.playSFX("xp");
            if (getNumberOfUnsolvedSlots(board) === 1) {
                newScore += difficulty;
                setScore(newScore);
                setDifficulty(calculateDifficulty(newScore));
                setGuessState("correct");
            }

            setBoard((prevBoard) => {
                const newBoard = [...prevBoard];
                newBoard[index] = chosenValue;
                return newBoard;
            });
        } else {
            audioStore.playSFX("break");
            newScore = Math.max(0, newScore - difficulty);
            setScore(newScore);
            setDifficulty(calculateDifficulty(newScore));
            setGuessState("incorrect");
        }
    };

    // Shortcut keys for selecting the colors
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            const value =
                SHORTCUT_KEYS[event.key as keyof typeof SHORTCUT_KEYS];
            if (value !== undefined) {
                setChosenValue(value);
            }
        };

        window.addEventListener("keydown", handleKeyPress);

        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, []);

    useEffect(() => {
        if (!isPlaying) {
            return;
        }
        const setRandomBoardState = (boardSize: number, difficulty: number) => {
            // Sample a "difficulty" number of positions
            const randomPositions = _.sampleSize(
                _.range(0, boardSize),
                difficulty,
            );

            // Sample a "difficulty" number of values
            const randomValues: number[] = [];
            for (let i = 0; i < difficulty; i++) {
                randomValues.push(Math.floor(Math.random() * 4));
            }

            // Set the positions in the board to the random values
            setBoard(() => {
                const newBoard = initBoardState(boardSize);
                randomPositions.forEach((position, index) => {
                    newBoard[position] = randomValues[index];
                });
                return newBoard;
            });
        };

        setAllowClick(false);
        setRandomBoardState(sideLength * sideLength, difficulty);
        setTimeout(() => {
            // Add 4 to all none -1 values in the board
            // Values >= 4 represent the values the user is trying to guess, respetive to the actual value -4
            // We do this to seperate which has been guessed and which hasn't
            setBoard((prevBoard) => {
                const newBoard = [...prevBoard];
                for (let i = 0; i < newBoard.length; i++) {
                    if (newBoard[i] !== -1) {
                        newBoard[i] += 4;
                    }
                }
                return newBoard;
            });
            setAllowClick(true);
        }, 2000);
    }, [difficulty, score, isPlaying, guessState]);

    // Update timer
    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prevTimeLeft) => {
                    if (prevTimeLeft === 0) {
                        setIsPlaying(false);
                        return INITIAL_TIME;
                    }
                    return prevTimeLeft - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isPlaying]);

    useEffect(() => {
        const value = localStorage.getItem(LS_MEMORY_HS);
        if (value) {
            setHighScore(parseInt(value));
        }
    }, []);

    useEffect(() => {
        if (score > highScore) {
            localStorage.setItem(LS_MEMORY_HS, score.toString());
            setHighScore(score);
        }
    }, [score, highScore, setHighScore]);

    const displayedBoard = board.map((value, index) => {
        return (
            <div
                key={index}
                className={clsx(`${COLOR_MAP[value < 4 ? value : -1]}`, {
                    "cursor-pointer hover:border-2 border-gray-400":
                        value === -1 || value >= 4,
                })}
                id={`box-${index}`}
                onClick={() => handleBoardClick(index)}
            ></div>
        );
    });

    const renderColorBox = (
        color: string,
        value: number,
        shortcutKey: string,
    ) => {
        return (
            <div className="flex flex-col items-center">
                <div
                    className={clsx(`box-${color}`, {
                        [`scale-110 opacity-100`]: chosenValue === value,
                        "opacity-50": chosenValue !== value,
                    })}
                    onClick={() => setChosenValue(value)}
                ></div>
                {!isMobile && <span>{shortcutKey}</span>}
            </div>
        );
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 justify-between w-full items-center text-sm sm:text-base">
            <div className="grid grid-cols-5 grid-rows-5 h-fit w-fit">
                {displayedBoard}
            </div>
            <div className="flex flex-col items-center gap-2 grow">
                <span className="underline">Choose color</span>
                <div className="flex justify-center items-center gap-4">
                    {renderColorBox("red", 0, "1")}
                    {renderColorBox("green", 1, "2")}
                    {renderColorBox("blue", 2, "3")}
                    {renderColorBox("yellow", 3, "4")}
                </div>

                <div className="w-full relative h-4 bg-gray-200 dark:bg-gray-600 rounded-lg mt-2 sm:mt-0">
                    <div
                        className="absolute left-0 rounded-lg top-0 h-full transition-all bg-green-600 "
                        style={{ width: `${(timeLeft / INITIAL_TIME) * 100}%` }}
                    />
                </div>

                <div className="flex items-center gap-4">
                    <span className="items-center flex flex-col sm:flex-row sm:gap-2">
                        <span className="font-semibold">Score:</span>{" "}
                        <span
                            className={clsx({
                                "text-green-600": guessState === "correct",
                                "text-red-600": guessState === "incorrect",
                            })}
                        >
                            {score}
                            {guessState === "correct"
                                ? "↑"
                                : guessState === "incorrect"
                                  ? "↓"
                                  : ""}
                        </span>
                    </span>
                    <span>|</span>
                    <span className="items-center flex flex-col sm:flex-row sm:gap-2">
                        <span className="font-semibold">Personal Best:</span>{" "}
                        {highScore}
                    </span>
                </div>
                <Button
                    onClick={() => {
                        if (!isPlaying) {
                            audioStore.playSFX("xp");
                        }
                        setIsPlaying((prevIsPlaying) => !prevIsPlaying);
                    }}
                >
                    {isPlaying ? "Stop" : "Start"}
                </Button>
            </div>
        </div>
    );
};

export default ViewMemoryGame;
