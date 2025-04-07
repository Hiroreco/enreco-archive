import { getBlurDataURL } from "@/lib/utils";
import Image from "next/image";

type ImageBlurProps = Omit<
    React.ComponentPropsWithoutRef<typeof Image>,
    "placeholder" | "blurDataURL"
>;

const ImageBlur = ({ src, ...props }: ImageBlurProps) => {
    const dataBlurUrl = getBlurDataURL(
        typeof src === "string" ? src : undefined,
    );
    return (
        <Image
            src={src}
            placeholder={dataBlurUrl ? "blur" : "empty"}
            blurDataURL={dataBlurUrl}
            {...props}
        />
    );
};

export default ImageBlur;
