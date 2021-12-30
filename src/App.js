import React, { useCallback, useEffect, useRef, useState } from 'react';
import imagetemplate from './json-data/image-template.json';
import { useCanvasForMask } from './utils/use-canvas';

// let targetSelected = false;
// var prevXState, prevYState;

const App = () => {
    const [maskTemplate, setMaskTemplate] = useState(imagetemplate[0].src);
    const [srcImage, setSrcImage] = useState(null);
    const targetImageRef = useRef(null);
    const {
        canvasRef,
        imageRef,
        templateRef,
        setSelectedImg,
        setSelectedTemplate,
        addTextArea,
        updateTextareaNode,
        updateTextareaAngle,
        drawTextForDownload,
        updateImageAngle,
        canvasBgColor,
        setCanvasBgColor,
        setTextColor,
        textColor,
        showToolbar,
    } = useCanvasForMask();
    const [textboxes, setTextBoxes] = useState([]);
    const [imageAngle, setImageAngle] = useState(0);

    const downloadImage = () => {
        drawTextForDownload();
        setTimeout(() => {
            let canvas = canvasRef.current;
            var link = document.createElement("a");
            link.download = "preview";
            link.href = canvas.toDataURL();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            link = null;
        }, 1000);
    };

    const addTextBox = () => {
        let textarea = {
            id: 'textarea-' + textboxes.length,
            text: 'Add text...',
            angle: 0
        }
        setTextBoxes([...textboxes, textarea]);
    }

    const onTextChange = (textareaId: string, text: string) => {
        for (let i = 0; i < textboxes.length; i++) {
            if (textboxes[i].id === textareaId) {
                let cpyTextboxes = [...textboxes];
                cpyTextboxes[i].text = text;
                setTextBoxes(cpyTextboxes);
                updateTextareaNode(textareaId, text);
                break;
            }
        }
    }

    const onTextAngleChange = (sliderId: string, angle: number) => {
        // console.log(sliderId, angle);

        for (let i = 0; i < textboxes.length; i++) {
            if (textboxes[i].id.split('-')[1] === sliderId.split('-')[1]) {
                let cpyTextboxes = [...textboxes];
                cpyTextboxes[i].angle = angle;
                setTextBoxes(cpyTextboxes);
                updateTextareaAngle('textarea-' + sliderId.split('-')[1], angle);
                break;
            }
        }
    }

    const onImageAngleChange = (angle: number) => {
        console.log(angle);
        setImageAngle(angle);
        updateImageAngle(angle);

        // for (let i = 0; i < textboxes.length; i++) {
        //     if (textboxes[i].id.split('-')[1] === sliderId.split('-')[1]) {
        //         let cpyTextboxes = [...textboxes];
        //         cpyTextboxes[i].angle = angle;
        //         setTextBoxes(cpyTextboxes);
        //         updateTextareaAngle('textarea-' + sliderId.split('-')[1], angle);
        //         break;
        //     }
        // }
    }

    // const onDrop = useCallback(acceptedFiles => {
    //     // Do something with the files
    // }, []);

    // const handleSelectedFiles = (acceptedFiles) => {
    //     acceptedFiles.map(file => {
    //         setSrcImage(URL.createObjectURL(file));
    //     });
    // }

    // const createMaskImage = () => {
    //     var canvas = document.getElementById('canvas');
    //     var ctx = canvas.getContext('2d');

    //     var template_mask = document.getElementById('data-mask');

    //     var reader = new FileReader();
    //     reader.onload = function (event) {
    //         var newImg = new Image();
    //         newImg.onload = function () {
    //             ctx.drawImage(newImg, 0, 0);
    //             var mask = document.createElement('img');
    //             mask.src = template_mask.src;
    //             console.log(template_mask.src);

    //             mask.onload = function () {
    //                 var template_width = mask.width;
    //                 var template_height = mask.height;
    //                 canvas.width = template_width;
    //                 canvas.height = template_height;
    //                 console.log('dhuksi');


    //                 ctx.drawImage(mask, 0, 0, template_width, template_height);
    //                 ctx.globalCompositeOperation = 'source-out';
    //                 ctx.drawImage(newImg, 0, 0);
    //                 ctx.globalCompositeOperation = 'source-over';
    //                 ctx.drawImage(mask, 0, 0, template_width, template_height);

    //                 // template_mask.src = imagecanvas.toDataURL();
    //             }
    //         };
    //         newImg.src = event.target.result;
    //     };
    //     reader.readAsDataURL(srcImage);

    //     newImg.onload = function () {
    //         var width = newImg.width;
    //         var height = newImg.height;

    //         var mask = document.createElement('img');
    //         mask.src = template_mask.src;
    //         console.log(template_mask.src);

    //         mask.onload = function () {
    //             var template_width = mask.width;
    //             var template_height = mask.height;
    //             // imagecanvas.width = template_width;
    //             // imagecanvas.height = template_height;
    //             console.log('dhuksi');


    //             imagecontext.drawImage(mask, 0, 0, template_width, template_height);
    //             // imagecontext.globalCompositeOperation = 'source-in';
    //             // imagecontext.drawImage(newImg, 0, 0, width, height);

    //             // template_mask.src = imagecanvas.toDataURL();
    //         }
    //     }
    // }

    useEffect(() => {
        setSelectedTemplate(templateRef.current.src);
        // let canvas = canvasRef.current;
        // let ctx = canvas.getContext('2d');
        // let templateDiv = templateRef.current;

        // // templateDiv.style.position = "absolute";
        // // templateDiv.style.top = canvas.offsetTop - window.scrollY + "px";
        // // templateDiv.style.left = canvas.offsetLeft + window.scrollX + "px";
        // var mask = document.createElement('img');
        // mask.src = templateRef.current.src;
        // // console.log(template_mask.src);

        // mask.onload = function () {
        //     var template_width = 300;
        //     var template_height = 300;
        //     // imagecanvas.width = template_width;
        //     // imagecanvas.height = template_height;
        //     // console.log('dhuksi');


        //     ctx.drawImage(mask, 0, 0, template_width, template_height);
        //     // imagecontext.globalCompositeOperation = 'source-in';
        //     // imagecontext.drawImage(newImg, 0, 0, width, height);

        //     // template_mask.src = imagecanvas.toDataURL();
        // }
    }, [maskTemplate]);

    // useEffect(() => {
    //     let canvas = canvasRef.current;
    //     var ctx = canvas.getContext('2d');
    //     let templateDiv = templateRef.current;
    //     let { left, top, width: templateWidth, height: templateHeight } = templateDiv.getBoundingClientRect();

    //     let targetImageDiv = targetImageRef.current;
    //     targetImageDiv.style.position = "absolute";
    //     targetImageDiv.style.top = canvas.offsetTop + "px";
    //     targetImageDiv.style.left = canvas.offsetLeft + templateWidth + window.scrollX + "px";
    // }, [srcImage]);

    // useEffect(() => {
    //     let canvas = canvasRef.current;
    //     let targetImageDiv = targetImageRef.current;
    //     targetImageDiv.addEventListener('mousedown', function (e) {
    //         targetSelected = true;
    //     });
    //     targetImageDiv.addEventListener('mouseup', function (e) {
    //         targetSelected = false;
    //     });
    //     document.addEventListener('mousemove', function (e) {
    //         if (targetSelected) {
    //             var mouseX = e.clientX - canvas.offsetLeft,
    //                 mouseY = e.clientY - canvas.offsetTop;

    //             if (prevXState === undefined || prevYState === undefined) {
    //                 prevXState = mouseX;
    //                 prevYState = mouseY;
    //             } else {

    //                 var dx = mouseX - prevXState;
    //                 var dy = mouseY - prevYState;
    //                 var newLeftOfTextarea = targetImageDiv.offsetLeft + dx;
    //                 var newTopOfTextarea = targetImageDiv.offsetTop + dy;

    //                 targetImageDiv.style.top = newTopOfTextarea + "px";
    //                 targetImageDiv.style.left = newLeftOfTextarea + "px";
    //                 prevXState = mouseX;
    //                 prevYState = mouseY;

    //                 containerCenter = getCenter(selectedContainer);

    //                 for (let i = 0; i < textinputs.length; i++) {
    //                     if (
    //                         textinputs[i].id.split("-")[1] ===
    //                         selectedContainer.id.split("-")[1]
    //                     ) {
    //                         textinputs[i].x = newLeftOfTextarea;
    //                         textinputs[i].y = newTopOfTextarea;
    //                         textinputs[i].cx = containerCenter.x;
    //                         textinputs[i].cy = containerCenter.y;
    //                         break;
    //                     }
    //                 }
    //             }
    //         }
    //     });
    // }, []);

    return (
        <div className="">
            <div className="w-full flex flex-row justify-between">
                {/* left div */}
                <div className="w-[15%] h-[calc(100vh-80px)] overflow-scroll flex flex-col gap-y-4">
                    {imagetemplate.map((template, idx) => {
                        return (
                            <div onClick={() => { setMaskTemplate(template.src) }} key={'template-' + idx} className='w-44 h-44 p-3 mb-3 cursor-pointer'>
                                <img className='w-full h-full' src={require('./images/image-template'+template.src)} alt="template-image" />
                                <h6 className='font-bold'>{template.name.toUpperCase()}</h6>
                            </div>
                        )
                    })}
                </div>
                <div className="w-[20%] h-[calc(100vh-80px)] overflow-scroll flex flex-col gap-y-4">
                    {/* file input */}
                    <div className="bg-light p-2 shadow-md">
                        <label>Image:&nbsp;&nbsp;</label>
                        <input
                            type="file"
                            onChange={(e) => {
                                setSelectedImg(e.target.files[0]);
                            }}
                        />
                        {/* range slider */}
                        <div className="slidecontainer">
                            <h6 className="text-sm font-bold text-gray-700 mb-3">Image Angle: {imageAngle}</h6>
                            <input
                                type="range"
                                min="-360"
                                max="360"
                                value={imageAngle}
                                className="slider"
                                id={`image-slider`}
                                onChange={e => onImageAngleChange(e.target.value)}>
                            </input>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <button
                            className="bg-light shadow-md px-5 py-2 rounded"
                            onClick={() => {
                                addTextArea();
                                addTextBox();
                            }}>
                            Text
                        </button>
                        {textboxes.map((box, idx) => {
                            return (
                                <div key={'box' + idx} className="mt-2">
                                    <h6 className="text-lg font-bold text-gray-700 mb-3">Text: {idx + 1}</h6>
                                    <textarea
                                        style={{
                                            resize: 'none',
                                            overflow: 'hidden',
                                            minHeight: '50px'
                                        }}
                                        key={box.id}
                                        id={box.id}
                                        value={box.text}
                                        onInput={e => {
                                            let textarea = e.target;
                                            textarea.style.height = "5px";
                                            textarea.style.height = (textarea.scrollHeight) + "px";
                                        }}
                                        onChange={e => onTextChange(e.target.id, e.target.value)}>
                                    </textarea>

                                    {/* range slider */}
                                    <div className="slidecontainer">
                                        <h6 className="text-sm font-bold text-gray-700 mb-3">Text Angle:</h6>
                                        <input
                                            type="range"
                                            min="0"
                                            max="360"
                                            value={box.angle}
                                            className="slider"
                                            id={`slider-${idx}`}
                                            onChange={e => onTextAngleChange(e.target.id, e.target.value)}>
                                        </input>
                                    </div>
                                    {box.angle}
                                </div>
                            )
                        })}
                    </div>

                    {/* color picker */}
                    <div className={`bg-light shadow-md p-2 mb-2`}>
                        <label>Text color(HEX Code):&nbsp;&nbsp;</label>
                        <input
                            className="p-2 border border-solid border-gray-200"
                            type="text"
                            value={textColor}
                            onChange={(e) => {
                                console.log(e.target.value);
                                setTextColor(e.target.value);
                            }}
                        />
                    </div>
                    <div className="bg-light shadow-md p-2">
                        <label>
                            Canvas background color(either &quot;transparent&quot; or &quot;hex code of
                            color&quot;):&nbsp;&nbsp;
                        </label>
                        <input
                            className="p-2 border border-solid border-gray-200"
                            type="text"
                            value={canvasBgColor}
                            onChange={(e) => {
                                console.log(e.target.value);
                                setCanvasBgColor(e.target.value);
                            }}
                            onKeyDown={e => {
                                if (e.keyCode === 13) {
                                    console.log('enter pressed ', e.target.value);

                                    setCanvasBgColor(e.target.value);
                                }
                            }}
                        />
                    </div>
                    {/* download */}
                    <div className="mt-auto">
                        <button className="bg-green-500 px-3 py-2 rounded-md" onClick={() => downloadImage()}>Dowload</button>
                    </div>
                </div>

                {/* right div */}
                <div className="w-[65%] h-[calc(100vh-80px)] overflow-y-scroll">
                    {/* canvas container */}
                    <div>
                        <div className='mx-auto w-[700px] h-[500px] flex flex-col items-center'>
                            <canvas className='bg-green-500' ref={canvasRef} width={700} height={500} id="canvas"></canvas>
                        </div>
                        <div  className='w-0 h-0 flex flex-row gap-x-5'>
                            <div className='w-[300px] h-[300px]'>
                                <img ref={templateRef} id="data-mask" className='w-full h-full' src={require('./images/image-template'+maskTemplate)} />
                            </div>
                        </div>
                        {/* <div className='border border-dashed border-gray-300 cursor-pointer'>
                            <input type="file" onChange={e => {
                                // setSrcImage(e.target.files[0]);
                                setSelectedImg(e.target.files[0]);
                            }} />
                        </div> */}
                    </div>
                    {/* download
                    <div className="mt-auto">
                        <button className="bg-green-500 px-3 py-2 rounded-md" onClick={() => downloadImage()}>Dowload</button>
                    </div> */}
                    <h3 className="text-red-500 text-2xl ml-22 mt-2">
                        Click on the selected image for resizing
                    </h3>
                </div>
            </div>
        </div>

        // <div className='w-full h-full flex flex-row gap-x-3'>
        //     <div className='w-1/3 h-[calc(100vh-80px)] bg-transparent overflow-scroll'>
        //         {imagetemplate.map((template, idx) => {
        //             return (
        //                 <div onClick={() => { setMaskTemplate(template.src) }} key={'template-' + idx} className='w-44 h-44 p-3 mb-3 cursor-pointer'>
        //                     <img className='w-full h-full' src={template.src} alt="template-image" />
        //                     <h6 className='font-bold'>{template.name.toUpperCase()}</h6>
        //                 </div>
        //             )
        //         })}
        //     </div>
        //     <div className='w-2/3 h-[calc(100vh-80px)] overflow-y-scroll p-2 bg-light relative'>
        //         <div className='mx-auto w-[700px] h-[500px] flex flex-col items-center'>
        //             <canvas className='bg-green-500' ref={canvasRef} width={500} height={500} id="canvas"></canvas>
        //         </div>
        //         {/* <div className='flex flex-row gap-x-5'>
        //             <div className='w-[300px] h-[300px]'>
        //                 <img id="data-mask" className='w-full h-full' src={maskTemplate} />
        //             </div>
        //         </div> */}
        //         {/* <div>
        //             <button onClick={createMaskImage}>Create Mask</button>
        //         </div> */}

        //         {/* <div ref={templateRef} id="mask-template" className='w-[300px] h-[300px] absolute'>
        //             <img id="data-mask" className='w-full h-full' src={maskTemplate} />
        //         </div> */}
        //         {/* <div ref={targetImageRef} className='w-[0px] h-[0px]'>
        //             {srcImage && <img id="src-mask" className='w-full h-full' src={URL.createObjectURL(srcImage)} />}
        //         </div> */}
        //         <div className='border border-dashed border-gray-300 cursor-pointer'>
        //             <input type="file" onChange={e => {
        //                 // setSrcImage(e.target.files[0]);
        //                 setSelectedImg(e.target.files[0]);
        //             }} />
        //         </div>
        //         {/* <button onClick={downloadImage}>Download</button> */}
        //     </div>
        // </div>
    )
}

export default App;
