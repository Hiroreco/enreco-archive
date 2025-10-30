import ViewVideoArchiveCard from "@/components/view/media-archive/ViewMediaArchiveCard";
import ModalCollection from "../basic-modals/ModalCollection";

interface ViewVideoArchiveAppProps {
    bgImage: string;
}

const ViewVideoArchiveApp = ({ bgImage }: ViewVideoArchiveAppProps) => {

    return (
        <div className="w-screen h-dvh flex flex-col items-center justify-center overflow-hidden">
            <ViewVideoArchiveCard
                className="md:max-w-[1200px] w-[95vw] mt-8 sm:mt-2"
                bgImage={bgImage}
            />
            <ModalCollection modals={["fanart", "settings", "minigame", "music", "info"]} hideOnMobile={["minigame", "info"]}/>
        </div>
    );
};

export default ViewVideoArchiveApp;
