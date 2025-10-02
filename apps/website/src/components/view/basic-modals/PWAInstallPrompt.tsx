import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@enreco-archive/common-ui/components/button";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{
        outcome: "accepted" | "dismissed";
        platform: string;
    }>;
}

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState<boolean>(false);

    useEffect(() => {
        const handler = (e: Event) => {
            // Cast the event to our custom type
            const promptEvent = e as BeforeInstallPromptEvent;

            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();

            // Save the event so it can be triggered later
            setDeferredPrompt(promptEvent);

            // Show the custom install prompt
            setShowPrompt(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        // Check if already installed
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setShowPrompt(false);
        }

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        // Show the browser's install prompt
        deferredPrompt.prompt();

        // Wait for the user's response
        const { outcome } = await deferredPrompt.userChoice;

        console.log(`User response: ${outcome}`);

        // Clear the saved prompt
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        sessionStorage.setItem("pwa-prompt-dismissed", "true");
    };

    useEffect(() => {
        const dismissed = sessionStorage.getItem("pwa-prompt-dismissed");
        if (dismissed) {
            setShowPrompt(false);
        }
    }, []);

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-4 md:w-96 animate-in slide-in-from-bottom-5">
            <div className="shadow-lg border-2 bg-white rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                        <Download className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm">
                            <p className="font-semibold text-foreground mb-1">
                                Install App
                            </p>
                            <p className="text-muted-foreground">
                                Install this app on your device for quick and
                                easy access.
                            </p>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <Button
                                onClick={handleInstall}
                                size="sm"
                                className="flex-1"
                            >
                                Install
                            </Button>
                            <Button
                                onClick={handleDismiss}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                            >
                                Not Now
                            </Button>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
