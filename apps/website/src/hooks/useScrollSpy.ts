import { useEffect, useState } from "react";

export const useScrollSpy = (
    sectionIds: string[],
    options: IntersectionObserverInit = { threshold: 0.5 },
) => {
    const [activeSection, setActiveSection] = useState<string>("");

    useEffect(() => {
        const handler: IntersectionObserverCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(handler, options);

        sectionIds.forEach((id) => {
            const element = document.getElementById(id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, [sectionIds, options]);

    return activeSection;
};
