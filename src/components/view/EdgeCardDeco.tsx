import React from "react";

interface EdgeCardDecoProps {
    color: string;
}
const EdgeCardDeco = ({ color }: EdgeCardDecoProps) => {
    return (
        <div
            className="w-full h-[50px] rounded-t-lg dark:brightness-[0.87]"
            style={{
                backgroundColor: color,
            }}
        >
            <div className="deco w-full h-full opacity-50" />
        </div>
    );
};

export default EdgeCardDeco;
