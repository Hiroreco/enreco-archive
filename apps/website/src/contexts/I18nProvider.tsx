"use client";

import { NextIntlClientProvider } from "next-intl";
import { useState, useEffect, ReactNode } from "react";
import { useSettingStore } from "@/store/settingStore";

interface I18nProviderProps {
    children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
    const language = useSettingStore((state) => state.locale);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [messages, setMessages] = useState<Record<string, any> | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
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
            setMounted(true);
        };

        loadMessages();
    }, [language]);

    if (!mounted || !messages) {
        // Return a loading state that matches your app's design
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <NextIntlClientProvider locale={language} messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}
