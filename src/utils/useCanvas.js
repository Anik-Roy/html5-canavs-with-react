import { useRef, useState, useEffect } from "react";

var startX;
var startY;
var isDown = false;


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
var startX;
var startY;

export function useCanvas() {
    const canvasRef = useRef(null);
    const imageRef = useRef(null);
    const [text, setText] = useState("line 1\nline2\nline3\n");
    const [selectedImg, setSelectedImg] = useState(null);

    useEffect(() => {
        if (selectedImg === null) {
            const canvas = canvasRef.current;
            let img = imageRef.current;

            canvas.crossOrigin = "Anonymous";
            const ctx = canvas.getContext('2d');

            console.log('useCanvas ', canvas, ctx, img, text);

            img.onload = () => {
                // canvas.width = Math.min(canvas.width, img.width);
                // canvas.height = Math.min(canvas.height, img.height);
                let ctx = canvas.getContext('2d');
                // drawImage(img, ctx, canvas);
                var offsetX = 0.5;   // center x
                var offsetY = 0.5;   // center y
                drawImage(ctx, img, 0, 0, canvas.width, canvas.height, offsetX, offsetY);
                drawText(ctx, text);

            };

            drawText(ctx, text);
        } else {
            var reader = new FileReader();
            var img = "";
            reader.onload = function (event) {
                img = new Image();
                img.onload = function () {
                    const canvas = canvasRef.current;
                    canvas.crossOrigin = "Anonymous";
                    const ctx = canvas.getContext('2d');
                    // var offsetX = 0.5;   // center x
                    // var offsetY = 0.5;   // center y
                    var offsetX = canvas.offsetX;   // center x
                    var offsetY = canvas.offsetY;   // center y

                    imageWidth = img.width;
                    imageHeight = img.height;
                    imageRight = imageX + imageWidth;
                    imageBottom = imageY + imageHeight;

                    draw(true, true, img, canvas, ctx);

                    // canvas.mousedown = (e) => {
                    //     console.log(e);
                    // }
                    canvas.addEventListener('mousedown', (e) => {
                        console.log('mouse down');
                        handleMouseDown(e, canvas.offsetLeft, canvas.offsetTop, canvas, ctx, img);
                    });
                    canvas.addEventListener('mousemove', (e) => {
                        // console.log('mouse move');
                        handleMouseMove(e, canvas.offsetLeft, canvas.offsetTop, canvas, ctx, img);
                    });
                    canvas.addEventListener('mouseup', (e) => {
                        console.log('mouse up');
                        handleMouseUp(e, canvas, ctx, img);
                    });
                    canvas.addEventListener('mouseout', (e) => {
                        console.log('mouse out');
                        handleMouseOut(e, canvas, ctx, img);
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
                    // drawText(ctx, text);
                }
                img.src = event.target.result;
            }
            reader.readAsDataURL(selectedImg);
        }
    }, [text, selectedImg]);

    function addTextArea(canvas) {
        addTextAreaNew(canvas);
    }

    return { canvasRef, imageRef, text, setText, setSelectedImg, addTextArea };
}

function draw(withAnchors, withBorders, img, canvas, ctx) {
    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw the image
    ctx.drawImage(img, 0, 0, img.width, img.height, imageX, imageY, imageWidth, imageHeight);

    // optionally draw the draggable anchors
    if (withAnchors) {
        drawDragAnchor(imageX, imageY, ctx);
        drawDragAnchor(imageRight, imageY, ctx);
        drawDragAnchor(imageRight, imageBottom, ctx);
        drawDragAnchor(imageX, imageBottom, ctx);
    }

    // optionally draw the connecting anchor lines
    if (withBorders) {
        ctx.beginPath();
        ctx.moveTo(imageX, imageY);
        ctx.lineTo(imageRight, imageY);
        ctx.lineTo(imageRight, imageBottom);
        ctx.lineTo(imageX, imageBottom);
        ctx.closePath();
        ctx.stroke();
    }
}

function drawDragAnchor(x, y, ctx) {
    ctx.beginPath();
    ctx.fillStyle = "#000"
    ctx.arc(x, y, resizerRadius, 0, pi2, false);
    ctx.closePath();
    ctx.fill();
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


function handleMouseDown(e, offsetX, offsetY, canvas, ctx, img) {
    startX = parseInt(e.clientX - offsetX);
    startY = parseInt(e.clientY - offsetY);
    draggingResizer = anchorHitTest(startX, startY);
    draggingImage = draggingResizer < 0 && hitImage(startX, startY);
    console.log('offset x, y > ', canvas.offsetLeft, canvas.offsetTop);
}

function handleMouseUp(e, canvas, ctx, img) {
    draggingResizer = -1;
    draggingImage = false;
    draw(true, false, img, canvas, ctx);
}

function handleMouseOut(e, canvas, ctx, img) {
    handleMouseUp(e, canvas, ctx, img);
}

function handleMouseMove(e, offsetX, offsetY, canvas, ctx, img) {
    // console.log('mouse moving > ', draggingResizer, draggingImage);
    if (draggingResizer > -1) {
        let mouseX = parseInt(e.clientX - offsetX);
        let mouseY = parseInt(e.clientY - offsetY);

        // resize the image
        switch (draggingResizer) {
            case 0:
                //top-left
                imageX = mouseX;
                imageWidth = imageRight - mouseX;
                imageY = mouseY;
                imageHeight = imageBottom - mouseY;
                break;
            case 1:
                //top-right
                imageY = mouseY;
                imageWidth = mouseX - imageX;
                imageHeight = imageBottom - mouseY;
                break;
            case 2:
                //bottom-right
                imageWidth = mouseX - imageX;
                imageHeight = mouseY - imageY;
                break;
            case 3:
                //bottom-left
                imageX = mouseX;
                imageWidth = imageRight - mouseX;
                imageHeight = mouseY - imageY;
                break;
        }

        if (imageWidth < 25) { imageWidth = 25; }
        if (imageHeight < 25) { imageHeight = 25; }

        // set the image right and bottom
        imageRight = imageX + imageWidth;
        imageBottom = imageY + imageHeight;

        // redraw the image with resizing anchors
        draw(true, true, img, canvas, ctx);

    } else if (draggingImage) {
        let imageClick = false;

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
        draw(false, true, img, canvas, ctx);

    }
}

function drawImage(ctx, img, x, y, w, h, offsetX, offsetY) {
    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    // default offset is center
    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var iw = img.width,
        ih = img.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r,   // new prop. width
        nh = ih * r,   // new prop. height
        cx, cy, cw, ch, ar = 1;

    // decide which gap to fill    
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // fill image in dest. rectangle
    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
    // ctx.drawImage(img, 0, 0);
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

function addTextAreaNew(canvas) {
    alert('called')
    // if (!textarea) {
    let textarea = document.createElement('textarea');
    textarea.className = 'info';
    textarea.addEventListener('mousedown', e => mouseDownOnTextarea(e, textarea));
    document.body.appendChild(textarea);
    // }
    // var x = e.clientX - canvas.offsetLeft,
    //     y = e.clientY - canvas.offsetTop;
    // textarea.value = "x: " + x + " y: " + y;
    textarea.style.top = canvas.offsetTop + 'px';
    textarea.style.left = canvas.offsetLeft + 'px';
}

function mouseDownOnTextarea(e, textarea) {
    var x = textarea.offsetLeft - e.clientX,
        y = textarea.offsetTop - e.clientY;
    function drag(e) {
        textarea.style.left = e.clientX + x + 'px';
        textarea.style.top = e.clientY + y + 'px';
    }
    function stopDrag() {
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
    }
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
}