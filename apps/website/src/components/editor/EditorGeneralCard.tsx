import { cn } from "@/lib/utils";
import React, { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { LucideX } from "lucide-react";

import EditorCard from "@/components/editor/EditorCard";
import { EditorChapter, EditorChartData } from "@/lib/type";
import { Button } from "@enreco-archive/common-ui/components/button";
import { Input } from "@enreco-archive/common-ui/components/input";
import { Label } from "@enreco-archive/common-ui/components/label";

interface FormElements extends HTMLFormControlsCollection {
    chapterTitle: HTMLInputElement;
    dayTitle: HTMLInputElement;
    dayRecap: HTMLTextAreaElement;
    bgiSrc: HTMLInputElement;
    bgmSrc: HTMLInputElement;
}

interface GeneralFormElement extends HTMLFormElement {
    readonly elements: FormElements;
}

interface EditorGeneralCardProps {
    isVisible: boolean;
    chapterData: EditorChapter | null;
    dayData: EditorChartData | null;
    isDarkMode: boolean;
    onChapterTitleChange: (title: string) => void;
    onDayTitleChange: (title: string) => void;
    onDayRecapChange: (recap: string) => void;
    onBGImageChange: (src: string) => void;
    onBGMChange: (src: string) => void;
    onCardClose: () => void;
}

const EditorGeneralCard = ({
    isVisible,
    chapterData,
    dayData,
    isDarkMode,
    onChapterTitleChange,
    onDayTitleChange,
    onDayRecapChange,
    onBGImageChange,
    onBGMChange,
    onCardClose,
}: EditorGeneralCardProps) => {
    const [dayRecapMdData, setDayRecapMdData] = useState(
        dayData !== null ? dayData.dayRecap : "",
    );

    if (!isVisible || chapterData === null) {
        return;
    }

    const submitHandler = (event: React.FormEvent<GeneralFormElement>) => {
        event.preventDefault();

        const newChTitle = event.currentTarget.elements.chapterTitle.value;
        if (chapterData && newChTitle !== chapterData.title) {
            onChapterTitleChange(newChTitle);
        }

        const newDayTitle = event.currentTarget.elements.dayTitle.value;
        if (dayData && newDayTitle !== dayData.title) {
            onDayTitleChange(newDayTitle);
        }

        const newDayRecap = event.currentTarget.elements.dayRecap.value;
        if (dayData && newDayRecap !== dayData.dayRecap) {
            onDayRecapChange(newDayRecap);
        }

        const newBGImage = event.currentTarget.elements.bgiSrc.value;
        if (chapterData.bgiSrc !== newBGImage) {
            onBGImageChange(newBGImage);
        }

        const newBGM = event.currentTarget.elements.bgmSrc.value;
        if (chapterData.bgmSrc !== newBGM) {
            onBGMChange(newBGM);
        }
    };

    const onClose = () => {
        // Reset day recap on modal close. Yes this means unsaved changes will be blown away.
        setDayRecapMdData(dayData?.dayRecap || "");
        onCardClose();
    };

    return (
        <EditorCard>
            <h1 className="text-2xl font-bold">Chapter Info</h1>

            <Button onClick={onClose} className="absolute top-2 right-2">
                <LucideX />
            </Button>

            <form onSubmit={submitHandler}>
                <div className="my-2">
                    <Label className="my-1" htmlFor="title">
                        Title
                    </Label>
                    <Input
                        type="text"
                        id="title"
                        name="chapterTitle"
                        defaultValue={chapterData.title}
                    />
                </div>

                <div className="my-2">
                    <Label className="my-1" htmlFor="bg">
                        BG Image Url
                    </Label>
                    <Input
                        type="text"
                        id="bg"
                        name="bgiSrc"
                        defaultValue={chapterData.bgiSrc}
                    />
                </div>

                <div>
                    <Label className="my-1" htmlFor="bgm">
                        BGM Url
                    </Label>
                    <Input
                        type="text"
                        id="bgm"
                        name="bgmSrc"
                        defaultValue={chapterData.bgmSrc}
                    />
                </div>

                <div>
                    <Label className="my-1" htmlFor="day-title">
                        Day Title
                    </Label>
                    <Input
                        type="text"
                        id="day-title"
                        name="dayTitle"
                        defaultValue={dayData?.title}
                    />
                </div>

                <div
                    className={cn("my-2", dayData === null && "hidden")}
                    data-color-mode={isDarkMode ? "dark" : "light"}
                >
                    <Label className="block my-1" htmlFor="dayRecap">
                        Day Recap
                    </Label>
                    <MDEditor
                        id="dayRecap"
                        textareaProps={{ name: "dayRecap" }}
                        value={dayRecapMdData}
                        onChange={(value) => {
                            if (value) {
                                setDayRecapMdData(value);
                            }
                        }}
                        preview="edit"
                    />
                </div>

                <div className="my-2 flex flex-row w-full justify-center">
                    <Button className="w-2/4" type="submit">
                        Save
                    </Button>
                </div>
            </form>
        </EditorCard>
    );
};

export default EditorGeneralCard;
