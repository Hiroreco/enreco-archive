import { useEffect, useState } from "react";

export default function useScreenWidthChangeListener() {
    const [screenWidth, setScreenWidth] = useState(-1);

    useEffect(() => {
        if (screenWidth === -1) {
            setScreenWidth(window.innerWidth);
        }

        const screenWidthChangeListener = function () {
            if (screenWidth !== window.innerWidth) {
                setScreenWidth(window.innerWidth);
            }
        };

        window.addEventListener("resize", screenWidthChangeListener);
        return () => {
            window.removeEventListener("resize", screenWidthChangeListener);
        };
    }, [screenWidth]);

    if (typeof window === "undefined")
        return {
            screenWidth: 0,
            label: "xs",
        };
    if (screenWidth >= 1024) {
        return {
            screenWidth: screenWidth,
            label: "lg",
        };
    }
    if (screenWidth >= 768) {
        return {
            screenWidth: screenWidth,
            label: "md",
        };
    }
    if (screenWidth >= 640) {
        return {
            screenWidth: screenWidth,
            label: "sm",
        };
    }
    return {
        screenWidth: screenWidth,
        label: "xs",
    };
}
