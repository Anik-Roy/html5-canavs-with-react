import React, { useEffect, useRef, useState } from 'react'
import pizza from '../../images/pizza.jpg';

const Home = () => {
    let canvasRef = useRef(null);
    let imageRef = useRef(null);
    let userSelectedImageRef = useRef(null);
    const [text, setText] = useState("line 1\nline2\nline3\n");
    const [preview, setPreview] = useState("");
    // const [ctx, setCtx] = useState(null);

    // useEffect(() => {
    //     let canvas = canvasRef.current;
    //     canvas.crossOrigin = "Anonymous";
    //     let ctx = canvas.getContext('2d');
    //     setCtx(ctx);
    //     console.log(canvas);
    //     console.log(ctx);
    // }, []);

    function DrawOverlay(img, ctx) {
        // let canvas = canvasRef.current;
        ctx.drawImage(img, 0, 0);
        // ctx.fillStyle = 'rgba(30, 144, 255, 0.4)';
        // ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    useEffect(() => {
        let canvas = canvasRef.current;
        canvas.crossOrigin = "Anonymous";
        let img = imageRef.current;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            let ctx = canvas.getContext('2d');
            // setCtx(ctx);
            DrawOverlay(img, ctx);
            ctx.font = "40px Courier";
            ctx.fillStyle = '#ffffff';

            var lines = text.split('\n');
            let x = 50;
            let y = 50;

            for (var i = 0; i < lines.length; i++)
                ctx.fillText(lines[i], x, y + (i * y));
            // if (ctx !== null) {
            //     canvas.width = img.width;
            //     canvas.height = img.height;
            //     let ctx = canvas.getContext('2d');
            //     setCtx(ctx);
            //     DrawOverlay(img);
            //     ctx.font = "40px Courier";
            //     ctx.fillStyle = '#ffffff';

            //     var lines = text.split('\n');
            //     let x = 50;
            //     let y = 50;

            //     for (var i = 0; i < lines.length; i++)
            //         ctx.fillText(lines[i], x, y + (i * y));
            // }
        };
    }, []);

    useEffect(() => {
        let canvas = canvasRef.current;
        // if (ctx)
        //     ctx.clearRect(0, 0, canvas.width, canvas.height);

        let img = imageRef.current;

        if (img) {
            canvas.width = img.width;
            canvas.height = img.height;
            let ctx = canvas.getContext('2d');

            DrawOverlay(img, ctx);
            ctx.font = "40px Courier";
            ctx.fillStyle = '#ffffff';

            text.split("\n").map((item, i) => {
                let x = 50;
                let y = 50;
                ctx.fillText(item, x, y + (i * y));
            });
            // if (ctx !== null) {
            //     DrawOverlay(img);
            //     ctx.font = "40px Courier";
            //     ctx.fillStyle = '#ffffff';

            //     text.split("\n").map((item, i) => {
            //         // return (
            //         //   {item}
            //         // ctx.fillText(item, 50, 50)
            //         let x = 50;
            //         let y = 50;
            //         ctx.fillText(item, x, y + (i * y));
            //         // )
            //     });
            // }
        }
        // DrawText();
        // text_title = this.value;
        // ctx.fillText(text_title, 50, 50);
    }, [text]);

    const onCreatePreviewImage = () => {
        let canvas = canvasRef.current;
        setPreview(canvas.toDataURL());
    }

    const downloadImage = (uri, name) => {
        var link = document.createElement("a");
        link.download = 'preview';
        link.href = preview;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        link = null;
    }

    const handleImageUpload = (e) => {
        let reader = new FileReader();
        reader.onload = (event) => {
            let img = new Image();
            img.onload = function () {
                imageRef.current.src = img;
                let canvas = canvasRef.current;
                canvas.crossOrigin = "Anonymous";
                canvas.width = img.width;
                canvas.height = img.height;
                let ctx = canvas.getContext('2d');
                // setCtx(ctx);
                DrawOverlay(img, ctx);
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(e.target.files[0]);
    }

    return (
        <div style={{position: 'relative'}}>
            <div>
                <canvas ref={canvasRef} width={840} height={425} />
                <img ref={imageRef} src={pizza} className="hidden" />
            </div>
            <div>
                <input type="file" accept='image/*' name="img-file" onChange={handleImageUpload} />
                <textarea style={{position: "absolute", top: "20px", right: "200px"}} rows={10} name="text" value={text} onChange={e => {
                    setText(e.target.value)
                }} />
                <button onClick={onCreatePreviewImage}>Preview image</button>
                <img src={preview} alt={preview} />
                <button onClick={downloadImage}>Download this image</button>
            </div>
        </div>
    )
}

export default Home;
