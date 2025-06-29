import ViewTextModal from "@/components/view/ViewTextModal";
import { LS_SHIORI_STASH_UNLOCKED } from "@/lib/constants";
import { useAudioStore } from "@/store/audioStore";
import { Button } from "@enreco-archive/common-ui/components/button";
import { Input } from "@enreco-archive/common-ui/components/input";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

const ViewShioriGame = () => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answer, setAnswer] = useState("");
    const [error, setError] = useState("");
    const { playSFX } = useAudioStore();
    const [shioriPressed, setShioriPressed] = useState(false);

    const handleShioriPress = () => {
        if (!shioriPressed) {
            playSFX("chicken-pop");
            playSFX("shiori-chicken");
            setShioriPressed(true);
            setTimeout(() => {
                setShioriPressed(false);
            }, 10000);
        }
    };

    const questions = [
        {
            question: "Finish this sentence: Shiori of the ___",
            answer: ["nyavella", "nyavellas"],
        },
        {
            question:
                "What is Shiori's role in general? (Hint: She likes books)",
            answer: ["archiver"],
        },
        {
            question:
                "Which fumble knight did Shiori have a crush on in Chapter 2?",
            answer: ["gonathon", "gonathan"],
        },
        {
            question:
                "What title did Shiori claim for herself in Chapter 2? (Hint: Magic)",
            answer: ["witch"],
        },
        {
            question:
                'Who confronted Shiori for "writing lies" in one of her fanfics?',
            answer: ["elizabeth", "bloodflame", "liz", "erb"],
        },
        {
            question:
                "What name did Shiori give Nerissa on day 1 of Chapter 2?",
            answer: ["pickle", "pickles"],
        },
        {
            question: "What was Shiori's job in Chapter 2?",
            answer: ["chef", "cook"],
        },
        {
            question: "Shiori and Bijou once had a child, what was its name?",
            answer: ["khaos"],
        },
        {
            question:
                "On which day did Shiori decide to switch from being a chef to an writer?",
            answer: ["day 3", "three", "3", "three", "third"],
        },
        {
            question: "Shiori is very cute, true or false?",
            answer: ["true"],
        },
    ];

    const fanficList = [
        "bloodraven-smut",
        "chicken",
        "cucumber",
        "gyatt",
        "kiara-roa-snu",
        "pickles",
        "sea-x-lovers",
        "tam-x-tam",
        "the-cell",
        "the-princess-1",
        "the-princess-2",
    ];

    useEffect(() => {
        const unlocked = localStorage.getItem(LS_SHIORI_STASH_UNLOCKED);
        if (unlocked === "true") {
            setIsUnlocked(true);
        }
    }, []);

    const handleAnswer = () => {
        const userAnswer = answer.toLowerCase().trim();
        const correctAnswers = questions[currentQuestion].answer;

        const isCorrect = correctAnswers.some((correct) =>
            userAnswer.includes(correct.toLowerCase()),
        );

        if (isCorrect) {
            if (currentQuestion === questions.length - 1) {
                setIsUnlocked(true);
                playSFX("unlock");
                localStorage.setItem(LS_SHIORI_STASH_UNLOCKED, "true");
            } else {
                playSFX("xp");
                setCurrentQuestion((prev) => prev + 1);
            }
            setAnswer("");
            setError("");
        } else {
            playSFX("break");
            setError("Wrong answer! Try again.");
        }
    };

    if (!isUnlocked) {
        return (
            <div className="relative size-full flex flex-col items-center gap-4 p-4">
                <div className="font-bold text-xl mt-10">
                    Unlock Shiori's Stash
                </div>
                <div className="text-center font-semibold underline">
                    Question {currentQuestion + 1}:{" "}
                </div>
                <div className="text-center">
                    {questions[currentQuestion].question}
                </div>
                <div className="flex gap-2">
                    <Input
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Your answer"
                        onKeyDown={(e) => e.key === "Enter" && handleAnswer()}
                    />
                    <Button onClick={handleAnswer}>Submit</Button>
                </div>
                {error && <div className="text-red-500">{error}</div>}
                <Image
                    src="/images-opt/easter-shiori-opt.webp"
                    alt="Shiori Nyavella"
                    className={cn(
                        "absolute bottom-4 right-0 w-40  transition-opacity",
                        {
                            "cursor-pointer hover:opacity-50 opacity-20":
                                !shioriPressed,
                            "opacity-50": shioriPressed,
                        },
                    )}
                    width={200}
                    onClick={handleShioriPress}
                    height={200}
                />
            </div>
        );
    }

    return (
        <div className="relative size-full flex flex-col items-center overflow-hidden">
            <div className="font-bold mt-2">Shiori Nyavella's Stash</div>
            <Separator className="w-full mb-0 mt-2" />
            <div className="grid place-items-center sm:grid-cols-2 md:grid-cols-3 w-full h-[80%]">
                {fanficList.map((fanfic) => (
                    <ViewTextModal
                        key={fanfic}
                        textId={fanfic}
                        label={fanfic
                            .replace(/-/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                    />
                ))}
            </div>
            <Image
                src="/images-opt/easter-shiori-opt.webp"
                alt="Shiori Nyavella"
                className={cn(
                    "absolute bottom-4 right-0 w-40  transition-opacity",
                    {
                        "cursor-pointer hover:opacity-50 opacity-20":
                            !shioriPressed,
                        "opacity-50": shioriPressed,
                    },
                )}
                width={200}
                onClick={handleShioriPress}
                height={200}
            />
        </div>
    );
};

export default ViewShioriGame;
