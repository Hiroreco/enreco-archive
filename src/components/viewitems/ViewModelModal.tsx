import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Canvas } from "@react-three/fiber";
import { Center, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense } from "react";

interface ViewModelModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    modelPath: string;
}

const Model = ({ modelPath }: { modelPath: string }) => {
    const gltf = useGLTF(modelPath);
    return (
        <Center>
            <primitive object={gltf.scene} scale={3.5} />
        </Center>
    );
};

const ViewModelModal = ({
    open,
    onOpenChange,
    modelPath,
}: ViewModelModalProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <VisuallyHidden>
                <DialogTitle>Model viewer</DialogTitle>
            </VisuallyHidden>

            <DialogContent
                className="rounded-lg lg:w-[60vw] md:w-[80vw] max-w-none w-[95vw] h-[80vh] p-2"
                style={{
                    backgroundImage: `url('/images-opt/item-bg.webp')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <Canvas>
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
                    <OrbitControls enableZoom={true} enablePan={true} />
                </Canvas>
            </DialogContent>
        </Dialog>
    );
};

export default ViewModelModal;
