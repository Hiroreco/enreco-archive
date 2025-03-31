import React from "react";
import { Canvas } from "@react-three/fiber";
import { Center, OrbitControls, useGLTF } from "@react-three/drei";

interface ViewItemViewerProps {
    modelPath: string;
}

const ViewModelViewer = ({ modelPath }: ViewItemViewerProps) => {
    // Need to try/catch this because any invalid url would cause useGLTF to throw an error
    try {
        const gltf = useGLTF(modelPath, true);
        const scene = gltf.scene;
        if (!scene) {
            console.error("Model scene is undefined");
            return <div>Error loading 3D model</div>;
        }
        return (
            <Canvas
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
    } catch (error) {
        console.error("Error loading model:", error);
        return <div>Error loading 3D model</div>;
    }
};
export default ViewModelViewer;
