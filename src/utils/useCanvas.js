import { useRef, useState, useEffect } from "react";

export function useCanvas() {
    const canvasRef = useRef(null);
    const imageRef = useRef(null);
    const [text, setText] = useState("line 1\nline2\nline3\n");

    useEffect(() => {
        const canvas = canvasRef.current;
        let img = imageRef.current;

        canvas.crossOrigin = "Anonymous";
        const ctx = canvas.getContext('2d');

        console.log('useCanvas ', canvas, ctx, img, text);

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            let ctx = canvas.getContext('2d');
            drawImage(img, ctx);
            drawText(ctx, text);

        };

        drawText(ctx, text);
    }, [text]);

    // useEffect(() => {
    //     drawText(ctx, text);
    // }, [text]);

    return { canvasRef, imageRef, text, setText };
}

function drawImage(img, ctx) {
    ctx.drawImage(img, 0, 0);
}

function drawText(ctx, text) {
    ctx.font = "40px Courier";
    ctx.fillStyle = '#ffffff';

    var lines = text.split('\n');
    let x = 50;
    let y = 50;

    for (var i = 0; i < lines.length; i++)
        ctx.fillText(lines[i], x, y + (i * y));
}