"use client";
import { useEffect, useState } from "react";

function getInitialHash() {
    if (global?.window && window.location.hash) {
        return window.location.hash.substring(1);
    }

    return "";
}

export function useBrowserHash(
    onBrowserHashChange: (hashValue: string) => void,
) {
    const [browserHash, setBrowserHash] = useState(getInitialHash());

    useEffect(() => {
        const hashChangeListener = () => {
            const hash = window.location.hash.substring(1);
            setBrowserHash(hash);
            onBrowserHashChange(hash);
        };

        window.addEventListener("hashchange", hashChangeListener);
        return () => {
            window.removeEventListener("hashchange", hashChangeListener);
        };
    }, [onBrowserHashChange]);

    useEffect(() => {
        window.history.replaceState({}, "", `#${browserHash}`);
    }, [browserHash]);

    return { browserHash, setBrowserHash };
}
