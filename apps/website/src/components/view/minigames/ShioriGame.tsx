import ViewShioriGameEasterEgg from "@/components/view/easter-eggs/ShioriGameEasterEgg";
import ViewTextModal from "@/components/view/utility-modals/TextModal";
import { useLocalizedData } from "@/hooks/useLocalizedData";
import { LS_KEYS } from "@/lib/constants";
import { useAudioStore } from "@/store/audioStore";
import { useSettingStore } from "@/store/settingStore";
import { Button } from "@enreco-archive/common-ui/components/button";
import { Input } from "@enreco-archive/common-ui/components/input";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import { Locale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const questionsEn = [
    {
        question: "Finish this sentence: Shiori of the _________",
        answer: ["nyavella", "nyavellas"],
    },
    {
        question: "What is Shiori's role in general? (Hint: She likes books)",
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
        question: "What name did Shiori give Nerissa on day 1 of Chapter 2?",
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
        answer: ["day 3", "three", "3", "third"],
    },
    {
        question: "Shiori is very cute, true or false?",
        answer: ["true"],
    },
];

const questionsJa = [
    {
        question: "この文を完成させてください: Shiori of the _________",
        answer: ["nyavella", "nyavellas", "ニャヴェラ", "ニャヴェラス"],
    },
    {
        question: "シオリの役割は何ですか？（ヒント：彼女は本が好きです）",
        answer: ["archiver", "アーカイバー"],
    },
    {
        question: "第2章でシオリが恋をした騎士は誰ですか？",
        answer: ["gonathon", "gonathan", "ゴナソン"],
    },
    {
        question: "第2章でシオリが自分に与えた称号は何ですか？（ヒント：魔法）",
        answer: ["witch", "魔女"],
    },
    {
        question:
            "シオリのファンフィクションで「嘘を書いた」と彼女を問い詰めたのは誰ですか？",
        answer: [
            "elizabeth",
            "bloodflame",
            "liz",
            "erb",
            "エリザベス",
            "ブラッドフレイム",
            "リズ",
        ],
    },
    {
        question: "第2章の1日目にシオリがネリッサに付けた名前は？",
        answer: ["pickle", "pickles", "ピクルス"],
    },
    {
        question: "第2章でシオリの仕事は何でしたか？",
        answer: ["chef", "cook", "シェフ", "料理人"],
    },
    {
        question: "シオリとビジューの子供の名前は？",
        answer: ["khaos", "カオス"],
    },
    {
        question: "シオリがシェフから作家に転職したのは何日目ですか？",
        answer: ["day 3", "three", "3", "third", "3日目", "三日目"],
    },
    {
        question: "シオリはとても可愛い、正しいですか？",
        answer: ["true", "はい", "正しい"],
    },
];

const getQuestionPack = (locale: Locale) => {
    if (locale === "ja") return questionsJa;
    return questionsEn;
};

const ViewShioriGame = () => {
    const t = useTranslations("modals.minigames.games.shiori");
    const locale = useSettingStore((state) => state.locale);

    const [isUnlocked, setIsUnlocked] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answer, setAnswer] = useState("");
    const [error, setError] = useState("");
    const { playSFX } = useAudioStore();
    const { getTextItem } = useLocalizedData();

    const questions = getQuestionPack(locale);

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
        const unlocked = localStorage.getItem(LS_KEYS.SHIORI_STASH_UNLOCKED);
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
                localStorage.setItem(LS_KEYS.SHIORI_STASH_UNLOCKED, "true");
            } else {
                playSFX("xp");
                setCurrentQuestion((prev) => prev + 1);
            }
            setAnswer("");
            setError("");
        } else {
            playSFX("break");
            setError(t("wrongAnswer"));
        }
    };

    if (!isUnlocked) {
        return (
            <div className="relative size-full flex flex-col items-center gap-4 p-4">
                <div className="font-bold text-xl mt-14">
                    {t("unlockShioriStash")}
                </div>
                <div className="text-center font-semibold underline">
                    {t("question")} {currentQuestion + 1}:{" "}
                </div>
                <div className="text-center">
                    {questions[currentQuestion].question}
                </div>
                <div className="flex gap-2">
                    <Input
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder={t("yourAnswer")}
                        onKeyDown={(e) => e.key === "Enter" && handleAnswer()}
                    />
                    <Button onClick={handleAnswer}>{t("submit")}</Button>
                </div>
                {error && <div className="text-red-500">{error}</div>}
                <ViewShioriGameEasterEgg className="bottom-8" />
            </div>
        );
    }
    return (
        <div className="relative size-full flex flex-col items-center">
            <div className="font-bold mt-2 flex-shrink-0">
                {t("shioriStash")}
            </div>
            <Separator className="w-full mb-0 mt-2 flex-shrink-0" />
            {/* Different height calculations for mobile vs desktop */}
            <div
                className="w-full overflow-y-auto md:h-[calc(100%-120px)]"
                style={{
                    height:
                        window.innerWidth < 768
                            ? "calc(100vh - 400px)"
                            : "calc(100% - 120px)",
                }}
            >
                <div className="grid place-items-center md:grid-cols-2 gap-y-4 w-full px-4 py-2">
                    {bookList.map((fanfic) => (
                        <ViewTextModal
                            key={fanfic}
                            textId={fanfic}
                            label={getTextItem(fanfic)?.title || fanfic}
                        />
                    ))}
                </div>
            </div>
            <Separator className="w-full flex-shrink-0" />
            <ViewShioriGameEasterEgg className="bottom-8" />
        </div>
    );
};

export default ViewShioriGame;
