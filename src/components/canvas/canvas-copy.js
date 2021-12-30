import React from 'react'
import { useCanvas } from '../../utils/use-canvas';
import pizza from '../../images/pizza.jpg';

const Canvas = () => {
    const {
        canvasRef,
        imageRef,
        setSelectedImg,
        addTextArea,
        drawTextForDownload,
        canvasBgColor,
        setCanvasBgColor,
        setTextColor,
        textColor,
        showToolbar
    } = useCanvas();

    const downloadImage = (uri, name) => {
        drawTextForDownload();
        setTimeout(() => {
            let canvas = canvasRef.current;
            var link = document.createElement("a");
            link.download = 'preview';
            link.href = canvas.toDataURL();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            link = null;
        }, 1000);
    }

    return (
        <div className='bg-[#edf0f2] relative px-16 py-5'>
            {/* toolbar */}
            <div className={`bg-green-500 p-2 mb-2 ${showToolbar ? "block" : "invisible"}`}>
                <div>
                    <label>Hex value for text color:&nbsp;&nbsp;</label>
                    <input className='p-2' type="text" value={textColor} onChange={e => {
                        console.log(e.target.value);
                        setTextColor(e.target.value);
                    }} />
                </div>
                <div>
                    <label>Canvas background color(either "transparent" or "hex code of color"):&nbsp;&nbsp;</label>
                    <input className='p-2' type="text" value={canvasBgColor} onChange={e => {
                        console.log(e.target.value);
                        setCanvasBgColor(e.target.value);
                    }} />
                </div>
            </div>
            {/* canvas container */}
            <div className=''>
                <canvas className='bg-white shadow-md' ref={canvasRef} width={840} height={425} />
                <img ref={imageRef} src={pizza} className="hidden" alt='default' />
            </div>
            <h3 className='text-red-500 text-2xl ml-5 mt-2'>Click on the selected image for resizing</h3>
            {/* controller */}
            <div className='mt-5'>
                {/* <textarea
                    style={{ position: "absolute", top: "20px", right: "200px" }}
                    rows={10}
                    value={text}
                    onChange={e => {
                        setText(e.target.value);
                    }} /> */}
                <button className='mr-5' onClick={() => { addTextArea(canvasRef.current) }}>Add Text</button>
                <input type="file" onChange={(e) => { setSelectedImg(e.target.files[0]) }} />
                <button onClick={() => downloadImage()}>Dowload</button>
            </div>
        </div>
    )
}

export default Canvas;
