import clsx from "clsx";
import React, { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { LucideX } from "lucide-react";

import EditorCard from "@/components/editor/EditorCard";
import { EditorChapter, EditorChartData } from "@/lib/type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormElements extends HTMLFormControlsCollection {
    chapterTitle: HTMLInputElement;
    dayRecap: HTMLTextAreaElement;
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
    onDayRecapChange: (recap: string) => void;
    onCardClose: () => void;
}

const EditorGeneralCard = ({
    isVisible,
    chapterData,
    dayData,
    isDarkMode,
    onChapterTitleChange,
    onDayRecapChange,
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

        const newDayRecap = event.currentTarget.elements.dayRecap.value;
        if (dayData && newDayRecap !== dayData.dayRecap) {
            onDayRecapChange(newDayRecap);
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

                <div className={clsx("my-2", dayData === null && "hidden")} data-color-mode={isDarkMode ? "dark" : "light"}>
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
