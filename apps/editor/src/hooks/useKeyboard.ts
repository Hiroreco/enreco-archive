import { useEditorStore } from "@/store/editorStore";
import { useEffect } from "react";

const useKeyboard = () => {
    const { mode, setMode } = useEditorStore();

    useEffect(() => {
        const defaultActions: Record<string, CallableFunction> = {
            a: () => setMode("place"),
            d: () => setMode("delete"),
            v: () => setMode("view"),
            e: () => setMode("edit"),
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            const activeElement = document.activeElement as HTMLElement;

            // Ignore keydown events when the target is an input, textarea, or contentEditable element
            const isEditableElement =
                activeElement.tagName === "INPUT" ||
                activeElement.tagName === "TEXTAREA" ||
                activeElement.isContentEditable;

            if (!isEditableElement) {
                const action = defaultActions[event.key];
                if (action) {
                    action();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [mode, setMode]);
};

export default useKeyboard;
