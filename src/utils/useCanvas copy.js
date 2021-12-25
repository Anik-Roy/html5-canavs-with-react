import { useRef, useState, useEffect } from "react";
import rotateicon from '../images/rotate.png';

var startX = 50;
var startY = 50;

var pi2 = Math.PI * 2;
var resizerRadius = 8;
var rr = resizerRadius * resizerRadius;
var draggingResizer = {
    x: 0,
    y: 0
};
var imageX = 50;
var imageY = 50;
var imageWidth, imageHeight, imageRight, imageBottom;
var draggingImage = false;

var prevXState, prevYState;
var withAnchors, withBorders;
// this var will hold the index of the hit-selected text

var selectedTextIndex = -1;

var mouseDownOnTextArea = false;
var textinputs = [];
var textareaNodes = [];
var tempImg = null;
var textInputColor = "#000000";
let rotateClicked = false;
let containerCenter;

export function useCanvas() {
    const canvasRef = useRef(null);
    const imageRef = useRef(null);
    const [selectedImg, setSelectedImg] = useState(null);
    const [textColor, setTextColor] = useState("#000000");
    const [showToolbar, setShowToolbar] = useState(false);

    let canvas;
    let ctx;

    useEffect(() => {
        textInputColor = textColor;
    }, [textColor]);

    useEffect(() => {
        if (selectedImg === null) {
            canvas = canvasRef.current;
            canvas.crossOrigin = "Anonymous";
            ctx = canvas.getContext('2d');
            // const canvas = canvasRef.current;
            // let img = imageRef.current;

            // canvas.crossOrigin = "Anonymous";
            // const ctx = canvas.getContext('2d');

            // console.log('useCanvas ', canvas, ctx, img, text);

            // img.onload = () => {
            //     // canvas.width = Math.min(canvas.width, img.width);
            //     // canvas.height = Math.min(canvas.height, img.height);
            //     let ctx = canvas.getContext('2d');
            //     // drawImage(img, ctx, canvas);
            //     var offsetX = 0.5;   // center x
            //     var offsetY = 0.5;   // center y
            //     drawImage(ctx, img, 0, 0, canvas.width, canvas.height, offsetX, offsetY);
            //     drawText(ctx, text);

            // };

            // drawText(ctx, text);
        } else {
            canvas = canvasRef.current;
            canvas.crossOrigin = "Anonymous";
            var reader = new FileReader();
            var img = "";
            reader.onload = function (event) {
                img = new Image();
                img.onload = function () {
                    tempImg = img;
                    ctx = canvas.getContext('2d');
                    // var offsetX = 0.5;   // center x
                    // var offsetY = 0.5;   // center y
                    // var offsetX = canvas.offsetX;   // center x
                    // var offsetY = canvas.offsetY;   // center y

                    imageWidth = imageWidth ?? Math.min(canvas.width - (imageX * 2), img.width);
                    imageHeight = imageHeight ?? Math.min(canvas.height - (imageY * 2), img.height);

                    // imageWidth = img.width;
                    // imageHeight = img.height;
                    imageRight = imageX + imageWidth;
                    imageBottom = imageY + imageHeight;

                    draw(img);

                    canvas.addEventListener('mousedown', (e) => {
                        console.log('mouse down');
                        handleMouseDown(e, canvas.offsetLeft, canvas.offsetTop, img);
                    });

                    canvas.addEventListener('mousemove', (e) => {
                        console.log('mouse move');
                        handleMouseMove(e, canvas.offsetLeft, canvas.offsetTop, img);
                    });

                    canvas.addEventListener('mouseup', (e) => {
                        console.log('mouse up');
                        handleMouseUp(e, img);
                    });

                    canvas.addEventListener('mouseout', (e) => {
                        console.log('mouse out');
                        handleMouseOut(e, img);
                    });

                    return () => {
                        canvas.removeEventListener('mousedown', (e) => {
                            console.log(e);
                        });
                        canvas.removeEventListener('mousemove', (e) => {
                            console.log(e);
                        });
                        canvas.removeEventListener('mouseup', (e) => {
                            console.log(e);
                        });
                        canvas.removeEventListener('mouseout', (e) => {
                            console.log(e);
                        });
                    };

                    // drawImage(ctx, img, 0, 0, canvas.width-20, canvas.height-20, offsetX, offsetY);
                }
                img.src = event.target.result;
            }
            reader.readAsDataURL(selectedImg);
        }
    }, [selectedImg]);

    function drawTextForDownload() {
        for (let i = 0; i < textareaNodes.length; i++) {
            textareaNodes[i].style.display = "none";
        }
        drawText();
        setTimeout(() => {
            for (let i = 0; i < textareaNodes.length; i++) {
                textareaNodes[i].style.display = "block";
            }
            draw(tempImg);
        }, 1200);
    }

    function addTextArea() {
        addTextAreaNew();
    }

    function draw(img) {
        // clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        console.log('clearing canvas');
        if (img) {
            // draw the image
            ctx.drawImage(img, 0, 0, img.width, img.height, imageX, imageY, imageWidth, imageHeight);
    
            // optionally draw the connecting anchor lines
            if (withBorders) {
                ctx.beginPath();
                ctx.moveTo(imageX, imageY);
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#07c6d6";
                ctx.lineTo(imageRight, imageY);
                ctx.lineTo(imageRight, imageBottom);
                ctx.lineTo(imageX, imageBottom);
                ctx.closePath();
                ctx.stroke();
            }
    
            // optionally draw the draggable anchors
            if (withAnchors) {
                drawDragAnchor(imageX, imageY, ctx);
                drawDragAnchor(imageRight, imageY, ctx);
                drawDragAnchor(imageRight, imageBottom, ctx);
                drawDragAnchor(imageX, imageBottom, ctx);
                // drawDragAnchor(imageX, (imageBottom + imageY) / 2, ctx);
                // drawDragAnchor(imageRight, (imageBottom + imageY) / 2, ctx);
                drawDragLine(imageX, (imageBottom + imageY) / 2, ctx);
                drawDragLine(imageRight, (imageBottom + imageY) / 2, ctx);
                drawDragLine(imageX + ((imageRight - imageX) / 2), imageY - 5, ctx);
                drawDragLine(imageX + ((imageRight - imageX) / 2), imageBottom - 5, ctx);
            }
        }
    }
    
    function drawDragLine(x, y) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineWidth = 10;
        ctx.strokeStyle = "#07c6d6";
        ctx.lineTo(x, y + 10);
        ctx.closePath();
        ctx.stroke();
    }
    
    function drawDragAnchor(x, y) {
        ctx.beginPath();
        ctx.fillStyle = "#fff"
        ctx.arc(x, y, resizerRadius, 0, pi2, false);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#07c6d6";
        ctx.stroke();
    }
    
    function mouseOverBorders(x, y) {
        if (
            (Math.abs(x - imageX) <= 2 && y >= imageY && y <= imageBottom && withAnchors) ||
            (Math.abs(x - imageRight) <= 2 && y >= imageY && y <= imageBottom && withAnchors)) {
            if (draggingResizer === -1)
                document.body.style.cursor = 'col-resize';
        } else if (Math.abs(y - imageY) <= 2 && (x >= imageX && x <= imageRight) && withAnchors) {
            if (draggingResizer === -1)
                document.body.style.cursor = 'ns-resize';
        } else if (Math.abs(y - imageBottom) <= 2 && (x >= imageX && x <= imageRight) && withAnchors) {
            if (draggingResizer === -1)
                document.body.style.cursor = 'ns-resize';
        } else {
            // if (draggingResizer === -1)
            document.body.style.cursor = 'alias';
        }
        switch (anchorHitTest(x, y)) {
            case 0:
                if (withAnchors) {
                    document.body.style.cursor = 'nwse-resize';
                }
                break;
            case 1:
                if (withAnchors)
                    document.body.style.cursor = 'nesw-resize';
                break;
            case 2:
                if (withAnchors)
                    document.body.style.cursor = 'nwse-resize';
                break;
            case 3:
                if (withAnchors)
                    document.body.style.cursor = 'nesw-resize';
                break;
            default:
                // document.body.style.cursor='alias';
                break;
        }
        // console.log('hello > ', x, imageX, y, (imageBottom + imageY) / 2);
    }
    
    function borderHitText(x, y) {
        if (Math.abs(x - imageX) <= 2 && (y >= imageY && y <= imageBottom)) {
            return 4;
        } else if ((Math.abs(x - imageRight) <= 2) && (y >= imageY && y <= imageBottom)) {
            return 5;
        } else if (Math.abs(y - 0) <= 2 && withAnchors) {
            document.body.style.cursor = 'ns-resize';
            return 6;
        } else if (Math.abs(y - imageBottom) <= 2 && withAnchors) {
            document.body.style.cursor = 'ns-resize';
            return 7;
        } else {
            return -1;
        }
    }
    
    function anchorHitTest(x, y) {
    
        var dx, dy;
    
        // top-left
        dx = x - imageX;
        dy = y - imageY;
        if (dx * dx + dy * dy <= rr) {
    
            return (0);
        }
        // top-right
        dx = x - imageRight;
        dy = y - imageY;
        if (dx * dx + dy * dy <= rr) {
            return (1);
        }
        // bottom-right
        dx = x - imageRight;
        dy = y - imageBottom;
        if (dx * dx + dy * dy <= rr) {
            return (2);
        }
        // bottom-left
        dx = x - imageX;
        dy = y - imageBottom;
        if (dx * dx + dy * dy <= rr) {
            return (3);
        }
        return (-1);
    }
    
    function hitImage(x, y) {
        return (x > imageX && x < imageX + imageWidth && y > imageY && y < imageY + imageHeight);
    }
    
    // test if x,y is inside the bounding box of texts[textIndex]
    function hitText(x, y, textIndex) {
        var text = textinputs[textIndex];
        return (x >= text.x && x <= text.x + text.width && y >= text.y - text.height && y <= text.y);
    }
    
    function handleMouseDown(e, offsetX, offsetY, img) {
        startX = parseInt(e.clientX - offsetX);
        startY = parseInt(e.clientY - offsetY);
        if (hitImage(startX, startY)) {
            withAnchors = true;
            withBorders = true;
        } else {
            withAnchors = false;
            withBorders = false;
        }
    
        for (var i = 0; i < textinputs.length; i++) {
            if (hitText(startX, startY, i)) {
                selectedTextIndex = i;
            }
        }
    
        draggingResizer = anchorHitTest(startX, startY);

        if (draggingResizer === -1)
            draggingResizer = borderHitText(startX, startY);
    
        draggingImage = draggingResizer < 0 && hitImage(startX, startY);
        console.log('offset x, y > ', canvas.offsetLeft, canvas.offsetTop);
        draw(img);
        // drawText(ctx, text);
    }
    
    function handleMouseUp(e, img) {
        draggingResizer = -1;
        draggingImage = false;
        prevXState = undefined;
        prevYState = undefined;
        selectedTextIndex = -1;
        // draw(img, canvas, ctx);
        // drawText(ctx, text)
    }
    
    function handleMouseOut(e, img) {
        handleMouseUp(e, img);
    }
    
    function handleMouseMove(e, offsetX, offsetY, img) {
        // console.log('mouse moving > ', draggingResizer, draggingImage);
        // draggingResizer = anchorHitTest(e.clientX - offsetX, e.clientX - offsetX);
        mouseOverBorders(e.clientX - offsetX, e.clientY - offsetY);
        if (hitImage(parseInt(e.clientX - offsetX), parseInt(e.clientY - offsetY))) {
            // draw(false, true, img, canvas, ctx);
            // withBorders = true;
            if (!withBorders) {
                withBorders = true;
                draw(img);
                // drawText(ctx, text);
            }
        } else {
            // draw(false, false, img, canvas, ctx);
            if (!withAnchors && withBorders) {
                withBorders = false;
                draw(img);
                // drawText(ctx, text);
            }
        }
    
        // let mouseX = parseInt(e.clientX - offsetX);
        // let mouseY = parseInt(e.clientY - offsetY);
        // console.log(parseInt(e.clientX - offsetX), parseInt(e.clientY - offsetY));
    
        if (draggingResizer > -1 && selectedTextIndex === -1) {
            console.log('inside dragging resizer');
            // alert('dragging resizer');
            let mouseX = parseInt(e.clientX - offsetX);
            let mouseY = parseInt(e.clientY - offsetY);
            console.log(mouseX, mouseY);
    
            // resize the image
            switch (draggingResizer) {
                case 0:
                    //top-left
                    // imageX = mouseX;
                    // imageWidth = imageRight - mouseX;
                    // imageY = mouseY;
                    // imageHeight = imageBottom - mouseY;
                    if (prevXState === undefined) {
                        prevXState = mouseX;
                        prevYState = mouseY;
                        imageX = mouseX;
                        imageWidth = imageRight - mouseX;
                        imageY = mouseY;
                        imageHeight = imageBottom - mouseY;
                    } else {
                        if (mouseX > prevXState) {
                            imageX = imageX + Math.abs(mouseX - prevXState);
                            imageY = imageY + Math.abs(mouseX - prevXState);
                            imageWidth = imageRight - imageX;
                            imageHeight = imageBottom - imageY;
                            console.log('inside if');
                        } else if (mouseX < prevXState) {
                            imageX = imageX - Math.abs(prevXState - mouseX);
                            imageY = imageY - Math.abs(prevXState - mouseX);
                            imageWidth = imageRight - imageX;
                            imageHeight = imageBottom - imageY;
                            console.log('inside else');
                        }
                        prevXState = mouseX;
                        prevYState = mouseY;
                    }
                    // console.log('case 0');
                    break;
                case 1:
                    //top-right
                    // imageY = mouseY;
                    // imageWidth = mouseX - imageX;
                    // imageHeight = imageBottom - mouseY;
                    if (prevXState === undefined) {
                        prevXState = mouseX;
                        prevYState = mouseY;
                        // imageX = mouseX;
                        imageY = mouseY;
                        imageWidth = mouseX - imageX;
                        imageHeight = imageBottom - mouseY;
                    } else {
                        if (mouseX > prevXState) {
                            // imageX = imageX + Math.abs(mouseX - prevXState);
                            imageY = imageY - Math.abs(mouseX - prevXState);
                            imageWidth = mouseX - imageX;
                            imageHeight = imageBottom - imageY;
                            console.log('inside if asdf');
                        } else if (mouseX < prevXState) {
                            // imageX = imageX - Math.abs(prevXState - mouseX);
                            imageY = imageY + Math.abs(prevXState - mouseX);
                            imageWidth = mouseX - imageX;
                            imageHeight = imageBottom - imageY;
                            console.log('inside else');
                        }
                        prevXState = mouseX;
                        prevYState = mouseY;
                    }
                    break;
                case 2:
                    //bottom-right
                    // imageWidth = mouseX - imageX;
                    // imageHeight = mouseY - imageY;
                    if (prevXState === undefined) {
                        prevXState = mouseX;
                        prevYState = mouseY;
                        imageWidth = mouseX - imageX;
                        imageHeight = mouseY - imageY;
                    } else {
                        if (mouseX > prevXState) {
                            // imageX = imageX + Math.abs(mouseX - prevXState);
                            // imageY = imageY + Math.abs(mouseX - prevXState);
                            imageWidth = imageRight - imageX + Math.abs(mouseX - prevXState);
                            imageHeight = imageBottom - imageY + Math.abs(mouseX - prevXState);
                            console.log('inside if');
                        } else if (mouseX < prevXState) {
                            imageWidth = imageRight - imageX - Math.abs(mouseX - prevXState);
                            imageHeight = imageBottom - imageY - Math.abs(mouseX - prevXState);
                            console.log('inside else');
                        }
                        prevXState = mouseX;
                        prevYState = mouseY;
                    }
                    break;
                case 3:
                    //bottom-left
                    // imageX = mouseX;
                    // imageWidth = imageRight - mouseX;
                    // imageHeight = mouseY - imageY;
                    if (prevXState === undefined) {
                        imageX = mouseX;
                        imageWidth = imageRight - mouseX;
                        imageHeight = mouseY - imageY;
                    } else {
                        if (mouseX > prevXState) {
                            // imageX = imageX + Math.abs(mouseX - prevXState);
                            // imageY = imageY + Math.abs(mouseX - prevXState);
                            imageWidth = imageRight - imageX + Math.abs(mouseX - prevXState);
                            imageHeight = imageBottom - imageY + Math.abs(mouseX - prevXState);
                            console.log('inside if');
                        } else if (mouseX < prevXState) {
                            imageWidth = imageRight - imageX - Math.abs(mouseX - prevXState);
                            imageHeight = imageBottom - imageY - Math.abs(mouseX - prevXState);
                            console.log('inside else');
                        }
                        prevXState = mouseX;
                        prevYState = mouseY;
                    }
                    break;
                case 4:
                    if (prevXState === undefined) {
                        prevXState = mouseX;
                        prevYState = mouseY;
                        imageX = mouseX;
                        imageWidth = imageRight - mouseX;
                        imageHeight = imageBottom - imageY;
                    } else {
                        if (mouseX > prevXState) {
                            imageX = imageX + Math.abs(mouseX - prevXState);
                            imageWidth = imageRight - imageX;
                            console.log('inside if');
                        } else if (mouseX < prevXState) {
                            imageX = imageX - Math.abs(prevXState - mouseX);
                            imageWidth = imageRight - imageX;
                            console.log('inside else');
                        }
                        prevXState = mouseX;
                        prevYState = mouseY;
                    }
                    break;
                case 5:
                    if (prevXState === undefined) {
                        prevXState = mouseX;
                        prevYState = mouseY;
                        // imageX = mouseX;
                        imageWidth = imageRight - imageX;
                    } else {
                        if (mouseX > prevXState) {
                            // imageX = imageX + Math.abs(mouseX - prevXState);
                            imageWidth = imageRight - imageX + Math.abs(mouseX - prevXState);
                            console.log('inside if');
                        } else if (mouseX < prevXState) {
                            // imageX = imageX - Math.abs(prevXState - mouseX);
                            imageWidth = imageRight - imageX - Math.abs(prevXState - mouseX);
                            console.log('inside else');
                        }
                        prevXState = mouseX;
                        prevYState = mouseY;
                    }
                    break;
                case 6:
                    if (prevXState === undefined) {
                        prevXState = mouseX;
                        prevYState = mouseY;
                        // imageX = mouseX;
                        imageHeight = imageBottom - imageY;
                    } else {
                        if (mouseY > prevYState) {
                            // imageX = imageX + Math.abs(mouseX - prevXState);
                            imageY = imageY + Math.abs(mouseY - prevYState);
                            imageHeight = imageBottom - imageY;
                            console.log('inside if');
                        } else if (mouseY < prevYState) {
                            // imageX = imageX - Math.abs(prevXState - mouseX);
                            imageY = imageY - Math.abs(mouseY - prevYState);
                            imageHeight = imageBottom - imageY;
                            console.log('inside else');
                        }
                        prevXState = mouseX;
                        prevYState = mouseY;
                    }
                    break;
    
                case 7:
                    if (prevXState === undefined) {
                        prevXState = mouseX;
                        prevYState = mouseY;
                        // imageX = mouseX;
                        imageHeight = imageBottom - imageY;
                    } else {
                        if (mouseY > prevYState) {
                            imageHeight = imageBottom - imageY + Math.abs(mouseY - prevYState);
                            console.log('inside if');
                        } else if (mouseY < prevYState) {
                            imageHeight = imageBottom - imageY - Math.abs(mouseY - prevYState);
                            console.log('inside else');
                        }
                        prevXState = mouseX;
                        prevYState = mouseY;
                    }
                    break;
                default:
                    break;
            }
    
            if (imageWidth < 25) { imageWidth = 25; }
            if (imageHeight < 25) { imageHeight = 25; }
    
            // set the image right and bottom
            imageRight = imageX + imageWidth;
            imageBottom = imageY + imageHeight;
    
            // redraw the image with resizing anchors
            draw(img);
            // drawText(ctx, text);
    
        } else if (draggingImage && selectedTextIndex === -1) {
            console.log('inside dragging image');
            // imageClick = false;
            // alert('dragging image');
    
            let mouseX = parseInt(e.clientX - offsetX);
            let mouseY = parseInt(e.clientY - offsetY);
    
            // move the image by the amount of the latest drag
            var dx = mouseX - startX;
            var dy = mouseY - startY;
            imageX += dx;
            imageY += dy;
            imageRight += dx;
            imageBottom += dy;
            // reset the startXY for next time
            startX = mouseX;
            startY = mouseY;
    
            // redraw the image with border
            draw(img);
            // drawText(ctx, text);
        }
    
        if (selectedTextIndex > -1) {
            let mouseX = parseInt(e.clientX - offsetX);
            let mouseY = parseInt(e.clientY - offsetY);
    
            var dx = mouseX - startX;
            var dy = mouseY - startY;
            startX = mouseX;
            startY = mouseY;
    
            // var tmpTextArray = [...text];
            var textObj = textinputs[selectedTextIndex];
            textObj.x += dx;
            textObj.y += dy;
    
            textinputs[selectedTextIndex] = textObj;
            // setText(tmpTextArray);
    
            draw(img);
            // drawText(ctx, tmpTextArray);
        }
    }
    
    function drawText() {
        // ctx.font = "10px Courier";
        ctx.fillStyle = '#000000';
        // ctx.fillText(`width - ${imageWidth}\nheight - ${imageHeight}`, imageX + 5, imageY + 10);
    
        // ctx.font = "14px Courier";
    
        for (var i = 0; i < textinputs.length; i++) {
            var lines = textinputs[i].text.split('\n');
            // console.log('drawText > ', lines);
    
            let x = textinputs[i].x;
            let y = textinputs[i].y;
    
            // textarea.style.top = (canvas.offsetTop + (30 * textinputs.length)) + 'px';
            // textarea.style.left = (canvas.offsetLeft) + 'px';
    
            ctx.font = textinputs[i].fontSize + ' ' + textinputs[i].fontFamily;
            let multipyBy = 0;
    
            for (var j = 0; j < lines.length; j++) {
                // ctx.fillText(lines[j], x - ctx.canvas.offsetLeft, (y - ctx.canvas.offsetTop - 5 + (16 * (j + 1))));
                // ctx.fillText(lines[j], x, (y + (14 * (j + 1))));
                // ctx.fillText(lines[j], 50, 50);
                console.log(lines[j] === "", j);
                if (lines[j] === "")
                    continue;
    
                console.log('processing ', x - ctx.canvas.offsetLeft, y - ctx.canvas.offsetTop - 5 + (multipyBy * 20));
                console.log('rotating ', textinputs[i].angle);
                // ctx.save();
                // ctx.translate(text[i].cx, text[i].cy);
                // ctx.rotate(20 * (Math.PI / 180));
                // ctx.rotate(text[i].angle);
                ctx.fillText(lines[j], x - ctx.canvas.offsetLeft, y - ctx.canvas.offsetTop + 14 + (multipyBy * 20));
                // ctx.fillText(lines[j],0, 0);
    
                // ctx.restore();
                multipyBy += 1;
    
                // ctx.beginPath();
                // ctx.moveTo(x, y - 20);
                // ctx.lineWidth = 2;
                // ctx.strokeStyle = "#07c6d6";
                // ctx.lineTo(x + text[i].width, y - 20);
                // ctx.lineTo(x + text[i].width, y + text[i].height);
                // ctx.lineTo(x, y + text[i].height);
                // ctx.closePath();
                // ctx.stroke();
            }
        }
    }
    
    function addTextAreaNew() {
        let container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = (canvas.offsetTop + (30 * textinputs.length)) + 'px';
        container.style.left = (canvas.offsetLeft) + 'px';
        container.style.backgroundColor = 'transparent';
        container.style.border = '1px solid #07c6d6';
    
        let textarea = document.createElement('div');
        textarea.className = 'info';
        textarea.id = 'textarea-' + textinputs.length;
    
        let textInputObj = {
            id: textarea.id,
            text: "Add text...",
            x: canvas.offsetLeft,
            y: (canvas.offsetTop + (30 * textinputs.length)),
            width: 80,
            height: 20,
            backgroundColor: 'transparent',
            fontSize: '14px',
            fontFamily: 'Courier',
            angle: 0,
            cx: 0,
            cy: 0
        };
        textarea.role = 'textbox';
        textarea.contentEditable = "true";
        textarea.ariaMultiLine = "true";
        textarea.textContent = "Add text...";
        textarea.style.position = 'relative';
        // textarea.style.top = (canvas.offsetTop + (30 * textinputs.length)) + 'px';
        // textarea.style.left = (canvas.offsetLeft) + 'px';
        textarea.style.backgroundColor = 'transparent';
        textarea.spellcheck = 'false';
        // textarea.style.border = '1px solid #07c6d6';
        textarea.style.fontSize = '14px';
        textarea.style.fontFamily = 'Courier';
    
        let rotateDiv = document.createElement('div');
        rotateDiv.style.width = "20px";
        rotateDiv.style.height = "20px";
        rotateDiv.style.position = 'absolute';
        rotateDiv.style.bottom = '-30' + 'px';
        rotateDiv.style.left = '45%';
        rotateDiv.style.overflow = "hidden";
    
        let rotateIndicator = document.createElement('img');
        rotateIndicator.src = rotateicon;
        rotateDiv.appendChild(rotateIndicator);
    
        textarea.appendChild(rotateDiv);
        // console.log(textarea);
    
        container.appendChild(textarea);
    
        document.body.appendChild(container);
    
        textinputs.push(textInputObj);
    
        // draw(tempImg, canvas, canvas.getContext('2d'));
        // drawText(canvas.getContext('2d'), textinputs);
    
        // console.log(textinputs);
    
        // textarea.style.resize = 'none';
        // textarea.style.overflow = 'hidden';
        // textarea.style.minHeight = '50px';
        // textarea.cols = '840';
        // textarea.style.maxHeight = '100px';
    
        console.log('creating > ', textarea.style.top, textarea.style.left);
    
        function getTextWidth(text, font) {
            // if given, use cached canvas for better performance
            // else, create new canvas
            var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
            var context = canvas.getContext("2d");
            context.font = font;
            var metrics = context.measureText(text);
            return metrics.width;
        };
    
        containerCenter = getCenter(container);
        
        rotateDiv.addEventListener('mousedown', function (e) {
            rotateClicked = true;
            rotateDiv.style.visibility = "hidden";
            console.log(textinputs);
        });
    
        document.addEventListener('mouseup', function (e) {
            rotateClicked = false;
            prevXState = undefined;
            prevYState = undefined;
            rotateDiv.style.visibility = "visible";
            console.log(rotateClicked);
        })
    
        document.addEventListener('mousemove', function (e) {
            if (rotateClicked) {
                var mouseX = e.clientX,
                    mouseY = e.clientY;
    
                const angle = Math.atan2(mouseY - containerCenter.y, mouseX - containerCenter.x);
                container.style.transform = `rotate(${angle}rad)`;
    
                for (let i = 0; i < textinputs.length; i++) {
                    if (textinputs[i].id === textarea.id) {
                        textInputObj.angle = angle;
                        textInputObj.cx = containerCenter.x;
                        textInputObj.cy = containerCenter.y;
                        break;
                    }
                }
            }
        });
    
        function getCenter(element) {
            const { left, top, width, height } = element.getBoundingClientRect();
            return { x: left + width / 2, y: top + height / 2 }
        }
    
        textarea.addEventListener('focus', function (e) {
            container.style.border = '2px solid #07c6d6';
            textarea.style.outline = 'none';
        });
        textarea.addEventListener('focusout', function (e) {
            container.style.border = '1px solid #07c6d6';
            textarea.style.outline = 'none';
        });
        textarea.addEventListener('input', function (e) {
            // textarea.style.color = 'transparent';
            // textarea.style.height = "5px";
            // textarea.style.height = (textarea.scrollHeight) + "px";
            // let ctx = canvas.getContext('2d');
            // let matrix = ctx.measureText(e.data);
            // let characterWidth = matrix.width;
            // console.log(matrix);
            for (let i = 0; i < textinputs.length; i++) {
                if (textinputs[i].id === textarea.id) {
                    // textinputs[i].height = textarea.scrollHeight;
                    console.log(textarea);
                    for (let j = 0; j < textarea.childNodes.length; j++) {
                        if (textarea.childNodes[j].childNodes.length > 0) {
                            // console.log(textarea.childNodes[i].childNodes);
                            console.log('hello > ', textarea.childNodes[j]);
                            if (j === 0) {
                                textinputs[i].text = textarea.childNodes[j].innerText ?? " ";
                            } else {
                                textinputs[i].text += '\n' + (textarea.childNodes[j].innerText ?? " ");
                            }
                        } else {
                            console.log('hello > ', textarea.childNodes[j]);
                            if (j === 0) {
                                textinputs[i].text = textarea.childNodes[j].nodeValue ?? " ";
                            } else {
                                textinputs[i].text += '\n' + (textarea.childNodes[j].nodeValue ?? " ");
                            }
                        }
                    }
                    // draw(tempImg, canvas, canvas.getContext('2d'));
                    // drawText(canvas.getContext('2d'), textinputs);
                    break;
                }
            }
        });
    
        textarea.addEventListener('mousedown', e => {
            mouseDownOnTextArea = true;
            prevXState = undefined;
            prevYState = undefined;
            // mouseDownOnTextarea(e, textarea, canvas);
            textarea.style.cursor = "auto";
            console.log('mouse down > ', textinputs);
            textarea.removeEventListener('mousemove', dragTextarea);
        });
    
        textarea.addEventListener('mouseup', e => {
            mouseDownOnTextArea = false;
            prevXState = undefined;
            prevYState = undefined;
            textarea.removeEventListener('mousemove', dragTextarea);
            console.log('mouse up');
            // textarea.removeEventListener('mouseup', stopDrag);
        });
    
        document.addEventListener('mouseup', e => {
            mouseDownOnTextArea = false;
            prevXState = undefined;
            prevYState = undefined;
            textarea.removeEventListener('mousemove', dragTextarea);
            console.log('mouse up');
            // textarea.removeEventListener('mouseup', stopDrag);
        });
    
        textarea.addEventListener('mousemove', e => {
            if (document.activeElement !== textarea)
                textarea.style.cursor = "pointer";
            if(!rotateClicked)
                dragTextarea(e);
            // console.log('mouse move > ', textInputObj);
        });
    
        textarea.addEventListener('mouseover', e => {
            console.log('mouseover');
        });
    
        textareaNodes.push(textarea);
    
        function dragTextarea(e) {
            console.log('drag');
            if (mouseDownOnTextArea) {
                var mouseX = e.clientX - canvas.offsetLeft,
                    mouseY = e.clientY - canvas.offsetTop;
    
                if (prevXState === undefined || prevYState === undefined) {
                    prevXState = mouseX;
                    prevYState = mouseY;
                    // console.log('inside if');
                } else {
                    // var newLeftOfTextarea;
                    // var newTopOfTextarea;
                    // console.log('calc > ', mouseX - prevXState, mouseY - prevYState);
                    // if(mouseX > prevXState) {
                    //     newLeftOfTextarea = canvas.offsetLeft + mouseX - prevXState;
                    // } else if(mouseX < prevXState) {
                    //     newLeftOfTextarea = canvas.offsetLeft - (prevXState - mouseX);
                    // }
                    // if(mouseY > prevYState) {
                    //     newTopOfTextarea = canvas.offsetTop + mouseY - prevYState;
                    // } else if(mouseY < prevYState) {
                    //     newTopOfTextarea = canvas.offsetTop - (prevYState - mouseY);
                    // }
                    // console.log(newTopOfTextarea, newLeftOfTextarea);
    
                    var dx = mouseX - prevXState;
                    var dy = mouseY - prevYState;
                    var newLeftOfTextarea = container.offsetLeft + dx;
                    var newTopOfTextarea = container.offsetTop + dy;
                    container.style.top = newTopOfTextarea + 'px';
                    container.style.left = newLeftOfTextarea + 'px';
                    prevXState = mouseX;
                    prevYState = mouseY;
    
                    containerCenter = getCenter(container);
    
                    for (let i = 0; i < textinputs.length; i++) {
                        if (textinputs[i].id === textarea.id) {
                            textinputs[i].x = newLeftOfTextarea;
                            textinputs[i].y = newTopOfTextarea;
                            textinputs[i].cx = containerCenter.x;
                            textinputs[i].cy = containerCenter.y;
                            break;
                        }
                    }
                    // draw(tempImg, canvas, canvas.getContext('2d'));
                    // drawText(canvas.getContext('2d'), textinputs);
                    // textinputs.map((input, idx) => {
                    //     if(input.id === textarea.id) {
                    //         // var cpyInput = {...input};
                    //         input.x = newLeftOfTextarea;
                    //         input.y = newTopOfTextarea;
                    //         return;
                    //     }
                    // });
                }
            };
        }
    
        canvas.addEventListener('mousedown', e => {
            var mouseX = e.clientX - canvas.offsetLeft,
                mouseY = e.clientY - canvas.offsetTop;
    
            var taTopX = textarea.offsetLeft;
            var taBottomX = taTopX + textarea.offsetHeight;
            var taTopY = taTopX + textarea.offsetWidth;
            var taBottomY = taBottomX + textarea.offsetWidth;
    
            if (!hitTestTextarea(mouseX, mouseY)) {
                console.log('hit textarea');
                container.style.borderWidth = '0px';
            }
    
            // console.log(taTopX, taTopY, taBottomX, taBottomY);
        });
    
        function hitTestTextarea(mouseX, mouseY) {
            var taTopX = container.offsetLeft;
            var taTopY = container.offsetTop;
            var taRight = container.offsetWidth;
            var taBottom = container.offsetHeight;
    
            if (mouseX >= taTopX && mouseX <= taRight && mouseY >= taTopY && mouseY <= taBottom) {
                return true;
            }
    
            return false;
        }
    }
    
    function mouseDownOnTextarea(e, textarea, canvas) {
        console.log('hit mouse down');
        var x = textarea.offsetLeft - e.clientX,
            y = textarea.offsetTop - e.clientY;
        function drag(e) {
            console.log('dragging > ', canvas.offsetTop, canvas.offsetLeft);
            textarea.style.left = e.clientX + 'px';
            textarea.style.top = e.clientY + 'px';
        }
        function stopDrag() {
            textarea.removeEventListener('mousemove', drag);
            textarea.removeEventListener('mouseup', stopDrag);
        }
        textarea.addEventListener('mousemove', drag);
        textarea.addEventListener('mouseup', stopDrag);
    }

    return {
        canvasRef,
        imageRef,
        // text,
        // setText,
        setSelectedImg,
        addTextArea,
        drawTextForDownload,
        setTextColor,
        textColor,
        showToolbar,
        setShowToolbar
    };
}

// function drawImage(ctx, img, x, y, w, h, offsetX, offsetY) {
//     if (arguments.length === 2) {
//         x = y = 0;
//         w = ctx.canvas.width;
//         h = ctx.canvas.height;
//     }

//     // default offset is center
//     offsetX = typeof offsetX === "number" ? offsetX : 0.5;
//     offsetY = typeof offsetY === "number" ? offsetY : 0.5;

//     // keep bounds [0.0, 1.0]
//     if (offsetX < 0) offsetX = 0;
//     if (offsetY < 0) offsetY = 0;
//     if (offsetX > 1) offsetX = 1;
//     if (offsetY > 1) offsetY = 1;

//     var iw = img.width,
//         ih = img.height,
//         r = Math.min(w / iw, h / ih),
//         nw = iw * r,   // new prop. width
//         nh = ih * r,   // new prop. height
//         cx, cy, cw, ch, ar = 1;

//     // decide which gap to fill    
//     if (nw < w) ar = w / nw;
//     if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
//     nw *= ar;
//     nh *= ar;

//     // calc source rectangle
//     cw = iw / (nw / w);
//     ch = ih / (nh / h);

//     cx = (iw - cw) * offsetX;
//     cy = (ih - ch) * offsetY;

//     // make sure source rectangle is valid
//     if (cx < 0) cx = 0;
//     if (cy < 0) cy = 0;
//     if (cw > iw) cw = iw;
//     if (ch > ih) ch = ih;

//     // fill image in dest. rectangle
//     ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
//     // ctx.drawImage(img, 0, 0);
// }