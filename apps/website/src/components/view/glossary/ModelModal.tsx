import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";

interface ModelModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    modelPath: string;
}

const Model = ({
    modelPath,
    paused,
}: {
    modelPath: string;
    paused: boolean;
}) => {
    const gltf = useGLTF(modelPath);
    const clonedScene = useMemo(() => gltf.scene.clone(), [gltf.scene]);
    const groupRef = useRef(null);

    useFrame((_, delta) => {
        if (!paused && groupRef.current) {
            (groupRef.current as any).rotation.y += delta * 0.3;
        }
    });

    return (
        <group ref={groupRef}>
            <Center>
                <primitive object={clonedScene} scale={3.5} dispose={null} />
            </Center>
        </group>
    );
};

const ModelModal = ({
    open,
    onOpenChange,
    modelPath,
}: ModelModalProps) => {
    const [paused, setPaused] = useState(false);

    const handleUserInteract = useCallback(() => {
        setPaused(true);
    }, []);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <VisuallyHidden>
                <DialogTitle>Model viewer</DialogTitle>
            </VisuallyHidden>

            <DialogContent
                className="rounded-lg lg:w-[60vw] md:w-[80vw] max-w-none w-[95vw] md:h-[80vh] h-[50vh] p-2"
                style={{
                    backgroundImage: `url('/images-opt/item-bg-opt.webp')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <Canvas
                    onPointerDown={handleUserInteract}
                    onTouchStart={handleUserInteract}
                    onWheel={handleUserInteract}
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
                        <Model modelPath={modelPath} paused={paused} />
                    </Suspense>
                    <OrbitControls enableZoom={true} enablePan={true} />
                </Canvas>
            </DialogContent>
        </Dialog>
    );
};

export default ModelModal;
