import React from "react";
import { Canvas } from "@react-three/fiber";
import { Center, OrbitControls, useGLTF } from "@react-three/drei";

interface ViewItemViewerProps {
    modelPath: string;
}

const ViewModelViewer = ({ modelPath }: ViewItemViewerProps) => {
    const { scene } = useGLTF(modelPath, true);
    return (
        <Canvas
            className="md:max-h-[300px] aspect-square rounded-lg"
            style={{
                backgroundImage: "url('/images-opt/item-bg.webp')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <ambientLight />
            <directionalLight />
            <Center>
                <primitive object={scene} scale={3.5} />
            </Center>

            <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
    );
};

export default ViewModelViewer;
