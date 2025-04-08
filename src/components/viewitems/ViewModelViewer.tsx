import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, OrbitControls, useGLTF } from "@react-three/drei";

interface ViewItemViewerProps {
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

const ViewModelViewer = ({ modelPath }: ViewItemViewerProps) => {
    return (
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
    );
};

export default ViewModelViewer;
