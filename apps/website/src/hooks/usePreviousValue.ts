import { useEffect, useRef } from "react";

export function usePreviousValue<T>(value: T) {
    const prevValue = useRef(value);

    useEffect(() => {
        prevValue.current = value;
    }, [value]);

    return prevValue.current;
}
