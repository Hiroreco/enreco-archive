import ViewModelModal from "@/components/view/items-page/ViewModelModal";
import { Button } from "@enreco-archive/common-ui/components/button";
import { Center, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Expand } from "lucide-react";
import { Suspense, useMemo, useState } from "react";

interface ViewItemViewerProps {
    modelPath: string;
}

const Model = ({ modelPath }: { modelPath: string }) => {
    const gltf = useGLTF(modelPath);
    const clonedScene = useMemo(() => gltf.scene.clone(), [gltf.scene]);

    return (
        <Center>
            <primitive object={clonedScene} scale={3.5} dispose={null} />
        </Center>
    );
};

const ViewModelViewer = ({ modelPath }: ViewItemViewerProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="relative w-full h-full">
            <Canvas
                className="rounded-lg"
                style={{
                    backgroundImage: "url('/images-opt/item-bg.webp')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <ambientLight />
                <directionalLight />
                <Suspense
                    fallback={
                        <Center>
                            <mesh>
                                <boxGeometry args={[1, 1, 1]} />
                                <meshStandardMaterial color="gray" />
                            </mesh>
                        </Center>
                    }
                >
                    <Model modelPath={modelPath} />
                </Suspense>
                <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
            <Button
                variant="secondary"
                size="icon"
                className="absolute bottom-2 right-2 opacity-70 hover:opacity-100"
                onClick={() => setIsModalOpen(true)}
            >
                <Expand className="h-4 w-4" />
            </Button>

            <ViewModelModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                modelPath={modelPath}
            />
        </div>
    );
};

export default ViewModelViewer;
