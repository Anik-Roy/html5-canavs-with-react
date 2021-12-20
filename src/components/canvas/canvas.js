import React, { useEffect, useState } from 'react'
import { useCanvas } from '../../utils/useCanvas';
import pizza from '../../images/pizza.jpg';

const Canvas = () => {
    const { canvasRef, imageRef, text, setText } = useCanvas();
    // const [text, setText] = useState("line 1\nline2\nline3\n");

    // useEffect(() => {
    //     let canvas = canvasRef.current;
    //     canvas.crossOrigin = "Anonymous";
    //     let img = imageRef.current;
    //     img.onload = () => {
    //         setImage(img);
    //     };
    // });

    // useEffect(() => {

    // }, [text]);

    // function drawImage(img, ctx) {
    //     ctx.drawImage(img, 0, 0);
    // }

    // function drawText(ctx) {
    //     ctx.font = "40px Courier";
    //     ctx.fillStyle = '#ffffff';

    //     var lines = text.split('\n');
    //     let x = 50;
    //     let y = 50;

    //     for (var i = 0; i < lines.length; i++)
    //         ctx.fillText(lines[i], x, y + (i * y));
    // }

    // function DrawOverlay(img, ctx) {
    //     ctx.drawImage(img, 0, 0);
    // }

    return (
        <div style={{ position: "relative" }}>
            {/* canvas container */}
            <div>
                <canvas ref={canvasRef} width={840} height={425} />
                <img ref={imageRef} src={pizza} className="hidden" />
            </div>
            {/* controller */}
            <div>
                <textarea
                    style={{ position: "absolute", top: "20px", right: "200px" }}
                    rows={10}
                    value={text}
                    onChange={e => {
                        setText(e.target.value);
                    }} />
            </div>
        </div>
    )
}

export default Canvas;
