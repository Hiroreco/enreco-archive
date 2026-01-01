import newsDataEn from "#/news.json";
import { useSettingStore } from "@/store/settingStore";
import { Button } from "@enreco-archive/common-ui/components/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import { NewsData } from "@enreco-archive/common/types";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Calendar, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface NewsModalProps {
    open: boolean;
    onClose: () => void;
}

const NewsModal = ({ open, onClose }: NewsModalProps) => {
    const tCommon = useTranslations("common");
    const backdropFilter = useSettingStore((state) => state.backdropFilter);

    const onOpenChange = (open: boolean) => {
        if (!open) {
            onClose();
        }
    };

    const newsData = newsDataEn as NewsData[];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <VisuallyHidden>
                <DialogTitle>News Modal</DialogTitle>
            </VisuallyHidden>
            <DialogContent
                showXButton={true}
                className="rounded-lg w-full flex flex-col"
                backdropFilter={backdropFilter}
            >
                <VisuallyHidden>
                    <DialogDescription>
                        View ENreco News updates
                    </DialogDescription>
                </VisuallyHidden>

                <div className="space-y-4">
                    <div className="border-b border-foreground/20 pb-4">
                        <h2 className="text-2xl font-bold text-center">
                            ENreco News
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1 text-center">
                            Latest updates and announcements
                        </p>
                    </div>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {newsData.map((post, index) => {
                            const postDate = new Date(post.date);
                            const formattedDate = postDate.toLocaleDateString(
                                "en-US",
                                {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                },
                            );

                            return (
                                <a
                                    key={index}
                                    href={post.src}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm block border border-foreground/20 rounded-lg p-4 group !text-foreground !visited:text-foreground mx-6"
                                >
                                    <div className="flex gap-3">
                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Image
                                                        src={post.avatarSrc}
                                                        alt="Author Avatar"
                                                        width={40}
                                                        height={40}
                                                        className="size-[40px] rounded-md object-cover"
                                                    />
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-bold">
                                                            {post.author}
                                                        </span>
                                                        <span className="text-muted-foreground text-sm">
                                                            @hololive_En
                                                        </span>
                                                    </div>
                                                </div>

                                                <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>

                                            <p className="mb-3 whitespace-pre-wrap">
                                                {post.content}
                                            </p>

                                            {/* Media */}
                                            {post.media.src &&
                                                post.media.type === "image" && (
                                                    <div className="rounded-lg overflow-hidden border border-foreground/10 mb-3">
                                                        <Image
                                                            src={post.media.src}
                                                            alt="Post media"
                                                            width={600}
                                                            height={338}
                                                            className="w-full h-auto"
                                                        />
                                                    </div>
                                                )}

                                            {post.media.src &&
                                                post.media.type === "video" && (
                                                    <div className="rounded-lg overflow-hidden border border-foreground/10 mb-3">
                                                        <video
                                                            controls
                                                            className="w-full h-auto"
                                                            src={post.media.src}
                                                        />
                                                    </div>
                                                )}

                                            {/* Footer with timestamp */}
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                <span>{formattedDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                </div>
                <DialogFooter className="border-t">
                    <DialogClose asChild>
                        <Button className="min-w-20 mt-2">
                            {tCommon("close")}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default NewsModal;
