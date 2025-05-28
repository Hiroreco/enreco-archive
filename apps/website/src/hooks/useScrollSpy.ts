import { useEffect, useState } from "react";

export const useScrollSpy = (
    sectionIds: string[],
    options: IntersectionObserverInit = { rootMargin: "0px", threshold: 0.3 },
) => {
    const [activeSection, setActiveSection] = useState<string>("");

    useEffect(() => {
        if (sectionIds.length === 0) return;

        // Use this to debounce multiple intersection events
        let debounceTimeout: NodeJS.Timeout | null = null;

        const observer = new IntersectionObserver((entries) => {
            // Clear any pending timeout
            if (debounceTimeout) clearTimeout(debounceTimeout);

            // Find intersecting entries
            const intersectingEntries = entries.filter(
                (entry) => entry.isIntersecting,
            );

            // Only update if we have an intersecting entry
            if (intersectingEntries.length > 0) {
                // Use the first intersecting entry (or the one most visible)
                debounceTimeout = setTimeout(() => {
                    setActiveSection(intersectingEntries[0].target.id);
                }, 50); // Small debounce to prevent rapid changes
            }
        }, options);

        // Setup observer for all sections
        const setupObserver = () => {
            let allFound = true;

            sectionIds.forEach((id) => {
                const element = document.getElementById(id);
                if (element) {
                    observer.observe(element);
                } else {
                    allFound = false;
                }
            });

            if (!allFound) {
                setTimeout(setupObserver, 100);
            } else if (sectionIds.length > 0 && !activeSection) {
                // Find first visible section
                const visibleSection = sectionIds.find((id) => {
                    const element = document.getElementById(id);
                    if (!element) return false;
                    const rect = element.getBoundingClientRect();
                    return rect.top >= 0 && rect.bottom <= window.innerHeight;
                });

                setActiveSection(visibleSection || sectionIds[0]);
            }
        };

        setupObserver();

        return () => {
            observer.disconnect();
            if (debounceTimeout) clearTimeout(debounceTimeout);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sectionIds, options]); // Remove activeSection dependency

    return activeSection;
};
