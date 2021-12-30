import { useRef } from "react";

export function useTempCanvas() {
    const canvasRef = useRef(null);

    return {canvasRef}
}