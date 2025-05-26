import TimestampHref from "@/components/view/markdown/TimestampHref";

const ViewShioriGameInfo = () => {
    return (
        <div className="flex flex-col gap-4">
            <p>
                Throughout the second chapter, true to her role as the Archiver,{" "}
                <span className="font-bold">Shiori</span> had written a variety
                of fanfics and memory pieces as commissions. These ranged from
                romantic and questionable tales, to NSFW content, as well as
                more serious reflections on past comrades.
            </p>

            <p>
                If you're curious about exploring Shiori's collection, you have
                two options: follow her journey (as well as others') day by day,
                or correctly answer 10 questions here to unlock her full
                archive.
            </p>

            <p>Let’s see how well you really know Shiorin.</p>

            <TimestampHref
                href="https://www.youtube.com/live/gVAtGMLBJos?si=EyxaXf2cdLNBNqxy&t=1107"
                caption="Getting freaky with Fanfics"
                type="embed"
            />
        </div>
    );
};

export default ViewShioriGameInfo;
