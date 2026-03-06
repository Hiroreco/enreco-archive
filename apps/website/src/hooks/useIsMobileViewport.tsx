import { isMobileViewport } from "@/lib/utils";
import { useEffect, useState } from "react";

function useIsMobileViewport(): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Set initial value
        const isMobileViewportValue = isMobileViewport();
        setIsMobile(isMobileViewportValue);

        const handleResize = () => setIsMobile(isMobileViewportValue);
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return isMobile;
}

export default useIsMobileViewport;
