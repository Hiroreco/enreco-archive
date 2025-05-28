import { useEffect, useState } from "react";

export const useScrollSpy = (
    sectionIds: string[],
    options: IntersectionObserverInit = { threshold: 0.5 },
) => {
    const [activeSection, setActiveSection] = useState<string>("");

    useEffect(() => {
        if (sectionIds.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, options);

        // Initial setup with retry mechanism
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

            // If not all elements were found, retry after a small delay
            if (!allFound) {
                setTimeout(setupObserver, 100);
            } else if (sectionIds.length > 0 && !activeSection) {
                // If all elements are found but no active section yet,
                // set the first visible section or the first section as active
                const firstVisibleSection = sectionIds.find((id) => {
                    const element = document.getElementById(id);
                    if (!element) return false;

                    const rect = element.getBoundingClientRect();
                    return rect.top >= 0 && rect.top <= window.innerHeight;
                });

                setActiveSection(firstVisibleSection || sectionIds[0]);
            }
        };

        setupObserver();

        return () => observer.disconnect();
    }, [sectionIds, options, activeSection]);

    return activeSection;
};
