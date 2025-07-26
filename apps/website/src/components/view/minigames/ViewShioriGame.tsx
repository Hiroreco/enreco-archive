import ViewShioriGameEasterEgg from "@/components/view/easter-eggs/ViewShioriGameEasterEgg";
import ViewTextModal from "@/components/view/utility-modals/ViewTextModal";
import { LS_SHIORI_STASH_UNLOCKED } from "@/lib/constants";
import { useAudioStore } from "@/store/audioStore";
import { Button } from "@enreco-archive/common-ui/components/button";
import { Input } from "@enreco-archive/common-ui/components/input";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import { useEffect, useState } from "react";

import textData from "#/text-data.json";

const ViewShioriGame = () => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answer, setAnswer] = useState("");
    const [error, setError] = useState("");
    const { playSFX } = useAudioStore();

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

    const bookList = [
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
        "a-knights-tale",
        "a-knights-wish",
        "fire-and-flight-1",
        "fire-and-flight-2",
        "fire-and-flight-3",
        "liz-journal-c2d1",
        "liz-journal-c2d2",
        "liz-journal-c2d4",
        "liz-journal-c2d5",
        "liz-journal-c2d6",
        "liz-journal-c2d7",
        "maven-in-blue",
    ];

    useEffect(() => {
        const unlocked = localStorage.getItem(LS_SHIORI_STASH_UNLOCKED);
        setIsUnlocked(false);
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
                <div className="font-bold text-xl mt-14">
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
                <ViewShioriGameEasterEgg />
            </div>
        );
    }

    return (
        <div className="relative size-full flex flex-col items-center">
            <div className="font-bold mt-2">Shiori Nyavella's Stash</div>
            <Separator className="w-full mb-0 mt-2" />
            <div className="overflow-y-auto max-h-[50vh] py-4 md:max-h-[80%] w-full">
                <div className="grid place-items-center md:grid-cols-3 gap-y-6 w-full">
                    {bookList.map((fanfic) => (
                        <ViewTextModal
                            key={fanfic}
                            textId={fanfic}
                            label={
                                textData[fanfic as keyof typeof textData]
                                    ?.title || fanfic
                            }
                        />
                    ))}
                </div>
            </div>
            <Separator className="w-full" />

            <ViewShioriGameEasterEgg />
        </div>
    );
};

export default ViewShioriGame;
