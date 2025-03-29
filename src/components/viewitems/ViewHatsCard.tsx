import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import "@/components/viewitems/Items.css";

const ViewHatsCard = () => {
    return (
        <Card className="items-card">
            <CardHeader>
                <CardTitle>Weapons</CardTitle>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-10 gap-4">
                    {Array.from({ length: 20 }).map((_, index) => (
                        <div
                            key={index}
                            className="border-green-300 border backdrop-blur-md rounded-lg p-4 cursor-pointer hover:scale-105 transition-all"
                        >
                            <img
                                className="w-[50px] h-auto mx-auto"
                                src="https://i.pinimg.com/736x/69/de/e6/69dee631b78c61b06d8b1ce53a48c347.jpg"
                                alt={`weapon-${index}`}
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default ViewHatsCard;
