import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
    className?: string;
}

const AudioVisualizer = ({ className }: AudioVisualizerProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(null);
    const smoothingRef = useRef<number[]>([]);
    const peakRef = useRef<number[]>([]);
    const adaptiveMaxRef = useRef<number>(0);

    useEffect(() => {
        const audioCtx = Howler.ctx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.3;
        Howler.masterGain.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;

        const barCount = 32;
        const barGap = 4;

        smoothingRef.current = new Array(barCount).fill(0);
        peakRef.current = new Array(barCount).fill(0);

        // Frequency mapping - focus more on lower frequencies like Monstercat
        const createFrequencyMap = (barCount: number, bufferLength: number) => {
            const map = [];
            for (let i = 0; i < barCount; i++) {
                // Logarithmic scale to emphasize lower frequencies
                const freq = Math.pow(i / (barCount - 1), 1.5);
                // Use first 70% of spectrum
                const index = Math.floor(freq * (bufferLength * 0.7));
                map.push(Math.min(index, bufferLength - 1));
            }
            return map;
        };

        const frequencyMap = createFrequencyMap(barCount, bufferLength);

        function draw() {
            analyser.getByteFrequencyData(dataArray);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const totalSpacing = barGap * (barCount - 1);
            const barWidth = (canvas.width - totalSpacing) / barCount;

            // Calculate adaptive maximum for dynamic range
            let currentMax = 0;
            for (let i = 0; i < barCount; i++) {
                const freqIndex = frequencyMap[i];
                const rawValue = dataArray[freqIndex];
                currentMax = Math.max(currentMax, rawValue);
            }

            // Smooth the adaptive maximum
            const adaptiveSmoothing = 0.05;
            adaptiveMaxRef.current =
                adaptiveMaxRef.current * (1 - adaptiveSmoothing) +
                currentMax * adaptiveSmoothing;

            // Ensure we have a reasonable minimum to prevent division by very small numbers
            const effectiveMax = Math.max(adaptiveMaxRef.current, 50);

            let x = 0;

            for (let i = 0; i < barCount; i++) {
                const freqIndex = frequencyMap[i];
                let rawValue = dataArray[freqIndex];

                // Normalize against adaptive maximum for dynamic range
                rawValue = Math.min(rawValue / effectiveMax, 1.0);

                // Apply frequency-based boost for higher frequencies (reduced)
                const frequencyBoost = 1 + (i / barCount) * 1.2;
                rawValue *= frequencyBoost;

                // Apply compression curve to prevent saturation
                // This creates an S-curve that expands low values and compresses high values
                const compressed =
                    rawValue < 0.5
                        ? 2 * rawValue * rawValue // Expand lower values
                        : 1 - 2 * (1 - rawValue) * (1 - rawValue); // Compress higher values

                // Update peak values with decay
                const peakDecay = 0.97;
                peakRef.current[i] = Math.max(
                    compressed,
                    peakRef.current[i] * peakDecay,
                );

                // Smooth the values
                const smoothingFactor = 0.4;
                smoothingRef.current[i] =
                    smoothingRef.current[i] * (1 - smoothingFactor) +
                    peakRef.current[i] * smoothingFactor;

                // Ensure minimum height for visual appeal (reduced)
                const minHeight = 0.02;
                const finalValue = Math.max(smoothingRef.current[i], minHeight);

                const barHeight = finalValue * canvas.height;

                // Dynamic gradient based on intensity
                const gradient = ctx.createLinearGradient(
                    0,
                    canvas.height - barHeight,
                    0,
                    canvas.height,
                );
                const intensity = finalValue;

                // Color intensity based on the actual value, not boosted
                gradient.addColorStop(
                    0,
                    `rgba(255, 255, 255, ${0.6 + intensity * 0.4})`,
                );
                gradient.addColorStop(
                    1,
                    `rgba(255, 255, 255, ${0.2 + intensity * 0.8})`,
                );

                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + barGap;
            }

            animationRef.current = requestAnimationFrame(draw);
        }

        draw();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            analyser.disconnect();
        };
    }, []);

    return (
        <canvas ref={canvasRef} width={300} height={40} className={className} />
    );
};

export default AudioVisualizer;
