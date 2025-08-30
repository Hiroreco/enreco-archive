"use client";

import { NextIntlClientProvider } from "next-intl";
import { useState, useEffect, ReactNode } from "react";
import { useSettingStore } from "@/store/settingStore";
import { cn } from "@enreco-archive/common-ui/lib/utils";

interface I18nProviderProps {
    children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
    const language = useSettingStore((state) => state.locale);
    const hasHydrated = useSettingStore((state) => state._hasHydrated);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [messages, setMessages] = useState<Record<string, any> | null>(null);

    useEffect(() => {
        // Only load messages after store has been hydrated
        // This is an issue on prod where the localStorage is not availiable yet, causing this to fetch the wrong locale data
        if (!hasHydrated) {
            return;
        }

        const loadMessages = async () => {
            try {
                const msgs = await import(`../../messages/${language}.json`);
                setMessages(msgs.default);
            } catch (error) {
                // Fallback to English if locale messages don't exist
                console.warn(
                    `Failed to load messages for ${language}, falling back to English`,
                    error,
                );
                const msgs = await import(`../../messages/en.json`);
                setMessages(msgs.default);
            }
        };

        loadMessages();
    }, [language, hasHydrated]);

    if (!hasHydrated || !messages) {
        return (
            <div
                className={cn("fixed inset-0 z-50")}
                style={{
                    backgroundImage: "url('images-opt/bg-1-dark-opt.webp')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            />
        );
    }

    return (
        <NextIntlClientProvider locale={language} messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}
