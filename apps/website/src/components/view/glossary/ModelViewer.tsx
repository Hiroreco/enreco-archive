import ModelModal from "@/components/view/glossary/ModelModal";
import { Button } from "@enreco-archive/common-ui/components/button";
import { Center, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Expand } from "lucide-react";
import { Suspense, useMemo, useState, useRef, useCallback } from "react";

interface ViewModelViewerProps {
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
            (groupRef.current as any).rotation.y += delta * 0.3; // rotation
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

const ModelViewer = ({ modelPath }: ViewModelViewerProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paused, setPaused] = useState(false);

    // Pause rotation on any pointer or wheel interaction
    const handleUserInteract = useCallback(() => {
        setPaused(true);
    }, []);

    return (
        <div className="relative size-full">
            <Canvas
                className="rounded-lg"
                style={{
                    backgroundImage: "url('/images-opt/item-bg-opt.webp')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
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

            <ModelModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                modelPath={modelPath}
            />
        </div>
    );
};

export default ModelViewer;
