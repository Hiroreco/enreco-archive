import { Button } from "@enreco-archive/common-ui/components/button";
import { Input } from "@enreco-archive/common-ui/components/input";
import React, { useEffect, useState } from "react";
import * as _ from "lodash";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { LS_GAMBLING_HS } from "@/lib/constants";
import { useAudioStore } from "@/store/audioStore";
import { useTranslations } from "next-intl";

const WINNING_MULTIPLIER = {
    "box-blue": 2,
    "box-green": 3,
    "box-yellow": 5,
    "box-red": 10,
};

// Initialize the board, there are four values, RED, YELLOW, GREEN, BLUE
// RED = 10, YELLOW = 5, GREEN = 3, BLUE = 2, mutipliers for winning
// See original stream for reference

const initializeBoard = () => {
    // Board should be a 1D array, flattening out the 2D array
    const sideLength = 5;
    const boardSize = sideLength * sideLength;

    const initialValueBoard: string[] = Array(boardSize).fill("box-empty");

    // Position board to keep track of the remaining cells' positions
    const initialPositionBoard = Array.from({ length: boardSize }, (_, i) => i);

    const bluePostions = [0, 1, 5, 3, 4, 9, 15, 20, 21, 19, 23, 24];
    const greenPositions = [2, 6, 10, 16, 22, 18, 14, 8];
    const yellowPositions = [7, 11, 17, 13];
    const redPositions = [12];

    bluePostions.forEach((pos) => {
        initialValueBoard[pos] = "box-blue";
    });

    greenPositions.forEach((pos) => {
        initialValueBoard[pos] = "box-green";
    });

    yellowPositions.forEach((pos) => {
        initialValueBoard[pos] = "box-yellow";
    });

    redPositions.forEach((pos) => {
        initialValueBoard[pos] = "box-red";
    });

    return { initialValueBoard, initialPositionBoard };
};

const { initialValueBoard, initialPositionBoard } = initializeBoard();

const ViewGamblingGame = () => {
    const t = useTranslations("modals.minigames.games.gambling");

    // Initialize the board
    const [valueBoard, setValueBoard] = useState(initialValueBoard);
    const [positionBoard, setPositionBoard] = useState(initialPositionBoard);
    const [chosenValue, setChosenValue] = useState("box-blue");
    const [betAmount, setBetAmount] = useState(0);
    const [currentBudget, setCurrentBudget] = useState(1000);
    const [currentRoll, setCurrentRoll] = useState(0);
    const [highScore, setHighScore] = useState(currentBudget);
    const [highlightedPositions, setHighlightedPositions] = useState<number[]>(
        [],
    );

    const audioStore = useAudioStore();

    const displayedBoard = valueBoard.map((value, index) => {
        const isHighlighted = highlightedPositions.includes(index);
        return (
            <div
                key={index}
                className={cn(
                    value,
                    isHighlighted && "transition-all opacity-60",
                )}
            ></div>
        );
    });

    // Init highscore
    useEffect(() => {
        const value = localStorage.getItem(LS_GAMBLING_HS);
        if (value) {
            setHighScore(parseInt(value));
        }
    }, []);

    // Update highscore
    useEffect(() => {
        if (currentBudget > highScore) {
            localStorage.setItem(LS_GAMBLING_HS, currentBudget.toString());
            setHighScore(currentBudget);
        }
    }, [currentBudget, highScore, setHighScore]);

    // Select 6 random positions 4 times in such a way that there is a 4s delay after each
    // Remove the selected positions from the board, by changing the value to box-empty
    // After 4 times, only one position/box is left
    useEffect(() => {
        const roll = () => {
            // Pre-roll effect
            let preRollCount = 0;
            const preRollInterval = setInterval(() => {
                // Highlight random positions
                if (preRollCount < 3) {
                    const randomHighlights = _.sampleSize(
                        positionBoard,
                        3 + Math.floor(Math.random() * 3),
                    );
                    setHighlightedPositions(randomHighlights);
                    audioStore.playSFX("click");
                }

                preRollCount++;
                if (preRollCount >= 4) {
                    // Show 3 pre-roll animations
                    audioStore.playSFX("explosion");
                    clearInterval(preRollInterval);
                    setHighlightedPositions([]); // Clear highlights

                    // Actual roll logic
                    const randomPositions = _.sampleSize(positionBoard, 6);
                    setValueBoard((prevValueBoard) => {
                        const newValueBoard = [...prevValueBoard];
                        randomPositions.forEach((position) => {
                            newValueBoard[position] = "box-empty";
                        });
                        return newValueBoard;
                    });

                    setPositionBoard((prevPositionBoard) => {
                        const newPositionBoard = prevPositionBoard.filter(
                            (position) => !randomPositions.includes(position),
                        );
                        return newPositionBoard;
                    });
                    setCurrentRoll((prevCurrentRoll) => prevCurrentRoll + 1);
                }
            }, 1000);
        };
        if (currentRoll > 0 && currentRoll <= 4) {
            roll();
        } else if (currentRoll > 4) {
            // Calculate the winning amount
            const winningColor = valueBoard.find(
                (value) => value !== "box-empty",
            );
            if (winningColor === chosenValue) {
                audioStore.playSFX("xp");
                const winningMutiplier =
                    WINNING_MULTIPLIER[
                        winningColor as keyof typeof WINNING_MULTIPLIER
                    ];
                setCurrentBudget((prevCurrentBudget) => {
                    return prevCurrentBudget + betAmount * winningMutiplier;
                });
            }

            setCurrentRoll(0);
        }
    }, [
        valueBoard,
        positionBoard,
        chosenValue,
        betAmount,
        currentBudget,
        currentRoll,
        audioStore,
    ]);

    const renderColorBox = (value: string) => {
        return (
            <div className="flex flex-col items-center">
                <div
                    className={cn(`${value}`, {
                        [`scale-110 opacity-100`]: chosenValue === value,
                        "opacity-50": chosenValue !== value,
                    })}
                    onClick={() => {
                        if (currentRoll === 0) setChosenValue(value);
                    }}
                ></div>
            </div>
        );
    };

    return (
        <div className="flex flex-col sm:flex-row items-center gap-1 w-full justify-center text-sm lg:text-base">
            <div className="grid grid-cols-5 grid-rows-5 h-fit w-fit">
                {displayedBoard}
            </div>
            <div className="flex flex-col md:gap-2 items-center grow mt-2">
                <div className="flex gap-2">
                    <span className="text-center">
                        <span className="font-semibold">
                            {t("currentBudget")}:
                        </span>{" "}
                        {currentBudget}
                    </span>
                    <span>|</span>
                    <span className="text-center">
                        <span className="font-semibold">
                            {t("personalRecord")}:
                        </span>{" "}
                        {highScore}
                    </span>
                </div>
                <div className="flex flex-col gap-2 items-center">
                    <span className="underline underline-offset-2">
                        {t("chooseColor")}
                    </span>
                    <div className="flex gap-2">
                        {renderColorBox("box-blue")}
                        {renderColorBox("box-green")}
                        {renderColorBox("box-yellow")}
                        {renderColorBox("box-red")}
                    </div>
                </div>
                <div className="flex flex-col gap-2 items-center">
                    <span className="underline underline-offset-2">
                        {t("betAmount")}
                    </span>
                    <div className="flex lg:flex-col items-center gap-2">
                        <Input
                            type="number"
                            onChange={(e) => setBetAmount(+e.target.value)}
                            className="max-w-[200px]"
                        />
                        <Button
                            disabled={
                                (currentRoll <= 4 && currentRoll !== 0) ||
                                currentBudget <= 0 ||
                                betAmount === 0 ||
                                betAmount > currentBudget
                            }
                            onClick={() => {
                                // reset the board
                                setValueBoard(initialValueBoard);
                                setPositionBoard(initialPositionBoard);

                                // start roll
                                audioStore.playSFX("xp");
                                setCurrentRoll(1);
                                setCurrentBudget((prevCurrentBudget) => {
                                    return prevCurrentBudget - betAmount;
                                });
                            }}
                        >
                            {currentBudget > 0
                                ? currentRoll === 0 || currentRoll > 4
                                    ? t("lockIn")
                                    : t("rolling")
                                : t("outOfMoney")}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewGamblingGame;
