import { useEffect, useState } from "react";

export default function useScreenWidthChangeListener() {
    const [screenWidth, setScreenWidth] = useState(-1);
    
    useEffect(() => {
        if(screenWidth === -1) {
            setScreenWidth(window.innerWidth);
        }

        const screenWidthChangeListener = function() {
            console.log("window.innerWidth: ", window.innerWidth);
            if(screenWidth !== window.innerWidth) {
                console.log("screenWidth != window.innerWidth", screenWidth, window.innerWidth)
                setScreenWidth(window.innerWidth);
            }
        }

        window.addEventListener("resize", screenWidthChangeListener);
        return () => {
            window.removeEventListener("resize", screenWidthChangeListener);
        };
    }, [screenWidth]);
}