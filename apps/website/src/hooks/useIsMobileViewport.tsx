import { isMobileViewport } from "@/lib/utils";
import { useEffect, useState } from "react";

function useIsMobileViewport(): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(isMobileViewport());
        };

        // Set initial value
        handleResize();

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return isMobile;
}

export default useIsMobileViewport;
