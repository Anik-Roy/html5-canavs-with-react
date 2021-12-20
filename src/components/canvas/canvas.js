import React from 'react'
import { useCanvas } from '../../utils/useCanvas';
import pizza from '../../images/pizza.jpg';

const Canvas = () => {
    const { canvasRef, imageRef, text, setText, setSelectedImg } = useCanvas();
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

    const downloadImage = (uri, name) => {
        let canvas = canvasRef.current;
        var link = document.createElement("a");
        link.download = 'preview';
        link.href = canvas.toDataURL();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        link = null;
    }

    return (
        <div style={{ position: "relative" }}>
            {/* canvas container */}
            <div>
                <canvas ref={canvasRef} width={840} height={425} />
                <img ref={imageRef} src={pizza} className="hidden" alt='default' />
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
                {/* <button onClick={() => {addTextArea(canvasRef.current)}}>Add Text</button> */}
                <input type="file" onChange={(e) => {setSelectedImg(e.target.files[0])}}/>
                <button onClick={() => downloadImage()}>Dowload</button>
            </div>
        </div>
    )
}

export default Canvas;
