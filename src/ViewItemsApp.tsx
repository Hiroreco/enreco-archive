import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ViewItemsApp = () => {
    return (
        <div className="w-screen h-screen">
            <Tabs
                defaultValue="account"
                className="w-[80%] h-[90%] mx-auto flex flex-col"
            >
                <TabsList className="w-full bg-transparent">
                    <TabsTrigger value="account">Weapons</TabsTrigger>
                    <TabsTrigger value="password">Hats</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className="flex-1">
                    <Card className="w-full h-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
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
                </TabsContent>
                <TabsContent value="password" className="flex-1">
                    <Card className="w-full card-deco h-full">Weapons</Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ViewItemsApp;
