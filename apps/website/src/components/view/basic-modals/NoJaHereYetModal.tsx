import { LS_KEYS } from "@/lib/constants";
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

const NoJaHereYetModal = () => {
    const locale = useSettingStore((state) => state.locale);
    const tCommon = useTranslations("common");

    const [open, setOpen] = useState(false);
    useEffect(() => {
        if (locale !== "ja") {
            return;
        }
        const hasVisited = localStorage.getItem(LS_KEYS.NO_TRANSLATION_YET);
        if (hasVisited !== "true") {
            setOpen(true);
            localStorage.setItem(LS_KEYS.NO_TRANSLATION_YET, "true");
        }
    }, [locale]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent backdropFilter="blur">
                <DialogHeader>
                    <DialogTitle>
                        <span className="inline-flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            翻訳についての注意
                        </span>
                    </DialogTitle>
                    <DialogDescription>
                        <span className="block">
                            ごめんなさい！この同人誌セクションの内容にはまだ翻訳がありませんが、後ほど追加される予定です！
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center mt-4 gap-4">
                    <Image
                        src="images-opt/easter-nerissa-opt.webp"
                        alt="Easter Nerissa"
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

export default NoJaHereYetModal;
