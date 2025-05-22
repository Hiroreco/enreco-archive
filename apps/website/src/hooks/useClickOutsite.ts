import { useEffect } from "react";

export function useClickOutside() {
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            // Find any open select content
            const openSelects = document.querySelectorAll(
                '[data-state="open"][role="combobox"]',
            );

            openSelects.forEach((select) => {
                // Check if click was outside the select
                if (
                    select instanceof HTMLElement &&
                    !select.contains(event.target as Node)
                ) {
                    // Click the trigger to close it
                    select.click();
                }
            });
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);
}
