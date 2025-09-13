import { LS_HAS_VISITED_TRANSLATION_DISCLAIMER } from "@/lib/constants";
import { useSettingStore } from "@/store/settingStore";
import { Button } from "@enreco-archive/common-ui/components/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";

const ViewTranslationDislaimerModal = () => {
    const locale = useSettingStore((state) => state.locale);
    const tCommon = useTranslations("common");

    const [open, setOpen] = useState(false);
    useEffect(() => {
        if (locale !== "ja") {
            return;
        }
        const hasVisited = localStorage.getItem(
            LS_HAS_VISITED_TRANSLATION_DISCLAIMER,
        );
        if (hasVisited !== "true") {
            setOpen(true);
            localStorage.setItem(LS_HAS_VISITED_TRANSLATION_DISCLAIMER, "true");
        }
    }, [locale]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        <span className="inline-flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            翻訳についての注意
                        </span>
                    </DialogTitle>
                    <DialogDescription>
                        <span className="block">
                            サイトの翻訳は機械翻訳をもとにしていますが、多くはチームによって校正・修正されています。とはいえ、すべてが完全に正確というわけではありません。
                        </span>
                        <span className="mt-4 block">
                            翻訳の改善にご協力いただける方は、
                            <a
                                href="https://x.com/hiroavrs"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                @hiroavrs
                            </a>
                            までご連絡いただくか、
                            <a
                                href="https://docs.google.com/forms/d/e/1FAIpQLSfiGd4FwosNnW2W8JdB8th0482LZMASbUnoNsAMPERxN7yZmw/viewform?usp=dialog"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                フィードバックフォーム
                            </a>
                            をご利用ください。
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center mt-4 gap-4">
                    <Image
                        src="images-opt/easter-cecilia-opt.webp"
                        alt="Easter Cecilia"
                        className="h-[100px] w-auto opacity-90"
                        width={100}
                        height={100}
                        priority={true}
                    />
                    <DialogFooter className="w-full">
                        <DialogClose asChild className="w-full">
                            <Button>{tCommon("ok")}</Button>
                        </DialogClose>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewTranslationDislaimerModal;
