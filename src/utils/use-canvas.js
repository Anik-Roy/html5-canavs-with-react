import { useRef, useState, useEffect } from "react";
import { CalcWidthHeight } from "./use-calc-width-height";

var startX = 50;
var startY = 50;

var pi2 = Math.PI * 2;
var resizerRadius = 8;
var rr = resizerRadius * resizerRadius;
var draggingResizer = -1;
var imageX = 50;
var imageY = 50;
var imageWidth, imageHeight, imageRight, imageBottom;
var imageAngle = 0;
var draggingImage = false;

var prevXState, prevYState;
var withAnchors, withBorders;

var mouseDownOnTextArea = false;
var textinputs = [];
var textareaNodes = [];
var containerNodes = [];
var selectedContainerId = -1;
var tempImg = null;
var tempTemplate = null;
let rotateClicked = false;
let containerCenter;
let canvas;
let ctx;
let selectedTextIndex = -1;

export function useCanvasForMask() {
    const canvasRef = useRef(null);
    const imageRef = useRef(null);
    const templateRef = useRef(null);
    const [selectedImg, setSelectedImg] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [textColor, setTextColor] = useState("#000000");
    const [canvasBgColor, setCanvasBgColor] = useState("transparent");
    const [showToolbar, setShowToolbar] = useState(false);

    useEffect(() => {
        if (selectedTextIndex !== -1) {
            setShowToolbar(true);
        } else {
            setShowToolbar(false);
        }
    }, [selectedTextIndex]);

    useEffect(() => {
        if (
            (textColor.length === 7 || textColor.length === 4) &&
            selectedTextIndex !== -1
        ) {
            textareaNodes[selectedTextIndex].style.color = textColor;
            textinputs[selectedTextIndex].color = textColor;
            // draw(tempImg);
            // drawText();
            console.log("updating color");
        }
    }, [textColor]);

    useEffect(() => {
        if (
            canvas &&
            (canvasBgColor === "transparent" ||
                canvasBgColor.length === 7 ||
                canvasBgColor.length === 4)
        ) {
            draw(tempImg);
        }
    }, [canvasBgColor]);

    useEffect(() => {
        if (selectedImg === null) {
            canvas = canvasRef.current;
            canvas.crossOrigin = "Anonymous";
            ctx = canvas.getContext("2d");
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
            var img;
            reader.onload = function (event) {
                img = new Image();
                img.onload = function () {
                    tempImg = img;
                    ctx = canvas.getContext("2d");
                    // var offsetX = 0.5;   // center x
                    // var offsetY = 0.5;   // center y
                    // var offsetX = canvas.offsetX;   // center x
                    // var offsetY = canvas.offsetY;   // center y

                    // let templateDiv = templateRef.current;
                    // let { left, top, width: templateWidth, height: templateHeight } = templateDiv.getBoundingClientRect();
                    // imageX = templateWidth;
                    imageWidth =
                        imageWidth ?? Math.min(canvas.width - imageX * 2, img.width);
                    imageHeight =
                        imageHeight ?? Math.min(canvas.height - imageY * 2, img.height);

                    imageWidth = imageHeight = Math.min(imageWidth, imageHeight);
                    // imageHeight =
                    //     imageHeight ?? Math.min(canvas.height - imageY * 2, img.height);
                    // imageWidth = img.width;
                    // imageHeight = img.height;
                    imageRight = imageX + imageWidth;
                    imageBottom = imageY + imageHeight;

                    var mask = document.createElement('img');
                    mask.src = templateRef.current.src;
                    // console.log(template_mask.src);

                    mask.onload = function () {
                        tempTemplate = mask;
                        var template_width = 300;
                        var template_height = 300;

                        draw(img, mask);

                        // draw(img);
                        // draw(img, selectedTemplate);

                        canvas.addEventListener("mousedown", (e) => {
                            console.log("mouse down");
                            handleMouseDown(e, canvas.offsetLeft, canvas.offsetTop, img, mask);
                        });

                        canvas.addEventListener("mousemove", (e) => {
                            // console.log('mouse move');
                            handleMouseMove(e, canvas.offsetLeft, canvas.offsetTop, img, mask);
                        });

                        canvas.addEventListener("mouseup", (e) => {
                            console.log("mouse up");
                            handleMouseUp(e, img, mask);
                        });

                        canvas.addEventListener("mouseout", (e) => {
                            console.log("mouse out");
                            handleMouseOut(e, img, mask);
                        });

                        return () => {
                            canvas.removeEventListener("mousedown", (e) => {
                                console.log(e);
                            });
                            canvas.removeEventListener("mousemove", (e) => {
                                console.log(e);
                            });
                            canvas.removeEventListener("mouseup", (e) => {
                                console.log(e);
                            });
                            canvas.removeEventListener("mouseout", (e) => {
                                console.log(e);
                            });
                        };
                    }

                    // drawImage(ctx, img, 0, 0, canvas.width-20, canvas.height-20, offsetX, offsetY);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(selectedImg);
        }
    }, [selectedImg]);

    useEffect(() => {
        var mask = document.createElement('img');
        mask.src = templateRef.current.src;
        // console.log(template_mask.src);

        mask.onload = function () {
            var template_width = 300;
            var template_height = 300;
            tempTemplate = mask;
            // setSelectedTemplate(mask);

            draw(selectedImg, mask);
        }
    }, [selectedTemplate]);

    function drawTextForDownload() {
        console.log(textinputs);

        for (let i = 0; i < containerNodes.length; i++) {
            containerNodes[i].style.visibility = "hidden";
            // textareaNodes[i].style.visibility = 'hidden';
        }
        drawText();
        setTimeout(() => {
            for (let i = 0; i < containerNodes.length; i++) {
                containerNodes[i].style.visibility = "visible";
                // textareaNodes[i].style.visibility = 'block';
            }
            draw(tempImg, tempTemplate);
        }, 3000);
    }

    function addTextArea() {
        let container = document.createElement("div");
        container.id = "container-" + textinputs.length;
        container.style.position = "absolute";
        // container.style.top = canvas.offsetTop - window.scrollY + 30 * textinputs.length + "px";
        // container.style.left = canvas.offsetLeft + window.scrollX + "px";
        container.style.top = canvas.offsetTop + (24 * textinputs.length) + "px";
        container.style.left = canvas.offsetLeft + "px";
        container.style.backgroundColor = "transparent";
        container.style.border = "1px solid #07c6d6";
        // container.style.height = '200px'

        let textarea = document.createElement("pre");
        textarea.className = "info";
        textarea.id = "textarea-" + textinputs.length;

        let textInputObj = {
            id: textarea.id,
            text: "Add text...",
            x: 0,
            y: 0 + 24 * textinputs.length,
            width: 0,
            height: 24,
            backgroundColor: "transparent",
            color: "#000000",
            fontSize: 24,
            fontFamily: "Courier",
            angle: 0,
            cx: 0,
            cy: 0,
            hasBorder: true,
        };
        ctx.font = textInputObj.fontSize + 'px ' + textInputObj.fontFamily;
        textInputObj.width = ctx.measureText(textInputObj.text).width;

        textarea.role = "textbox";
        textarea.contentEditable = "false";
        textarea.ariaMultiLine = "true";
        textarea.textContent = "Add text...";
        textarea.style.position = "relative";
        // textarea.style.top = (canvas.offsetTop + (30 * textinputs.length)) + 'px';
        // textarea.style.left = (canvas.offsetLeft) + 'px';
        textarea.style.backgroundColor = "transparent";
        textarea.spellcheck = false;
        // textarea.style.border = '1px solid #07c6d6';
        textarea.style.fontSize = "24px";
        textarea.style.fontFamily = "Courier";

        let rotateDiv = document.createElement("div");
        rotateDiv.style.width = "20px";
        rotateDiv.style.height = "20px";
        rotateDiv.style.position = "absolute";
        rotateDiv.style.bottom = "-30" + "px";
        rotateDiv.style.left = "45%";
        rotateDiv.style.overflow = "hidden";

        let rotateIndicator = document.createElement("img");
        rotateIndicator.src = "/rotate.png";
        rotateDiv.appendChild(rotateIndicator);

        // textarea.appendChild(rotateDiv);
        // console.log(textarea);

        container.appendChild(textarea);

        document.body.appendChild(container);

        textinputs.push(textInputObj);
        textareaNodes.push(textarea);
        containerNodes.push(container);

        console.log(
            container.offsetTop,
            container.offsetLeft,
            container.offsetWidth,
            container.offsetHeight
        );

        containerCenter = getCenter(container);

        rotateDiv.addEventListener("mousedown", function (e) {
            rotateClicked = true;
            selectedContainerId = parseInt(container.id.split("-")[1]);
            rotateDiv.style.visibility = "hidden";
            console.log(textarea.offsetHeight, textarea.offsetWidth);
        });

        // textarea.addEventListener('mousemove', e => {
        //     if (document.activeElement !== textarea)
        //         textarea.style.cursor = "pointer";
        //     if (!rotateClicked)
        //         dragTextarea(e);
        //     // console.log('mouse move > ', textInputObj);
        // });
    }

    function updateTextareaNode(id: string, text: string) {
        for (let i = 0; i < textareaNodes.length; i++) {
            if (textareaNodes[i].id === id) {
                console.log(text);
                textareaNodes[i].textContent = text;
                let lines = text.split("\n");
                console.log(lines);
                for (let j = 0; j < textinputs.length; j++) {
                    if (textinputs[j].id === textareaNodes[i].id) {
                        textinputs[j].text = text;
                        ctx.font = textinputs[j].fontSize + 'px ' + textinputs[j].fontFamily;
                        textinputs[j].width = ctx.measureText(textinputs[j].text).width;
                        break;
                    }
                }
            }
        }
    }

    function updateTextareaAngle(id: string, angle: number) {
        console.log(id, angle);

        for (let i = 0; i < textareaNodes.length; i++) {
            if (textareaNodes[i].id === id) {
                console.log(angle);
                const radianAngle = angle * (Math.PI / 180);
                containerNodes[i].style.transform = `rotate(${angle}deg)`;
                for (let j = 0; j < textinputs.length; j++) {
                    if (textinputs[j].id === textareaNodes[i].id) {
                        textinputs[j].angle = radianAngle;
                        // let { left, top } = containerNodes[i].getBoundingClientRect();
                        // console.log(`new text top: ${top}; new text left: ${left}`);
                        // textinputs[i].x = left;
                        // textinputs[i].y = top;
                        break;
                    }
                }
            }
        }
    }

    function updateImageAngle(angle: number) {
        imageAngle = angle;
        draw(tempImg, tempTemplate);
    }

    function draw(img, template) {
        // clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = canvasBgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // console.log("clearing canvas ", canvasBgColor);

        if (img) {
            ctx.save();
            ctx.translate(imageX + imageWidth / 2, imageY + imageHeight / 2); //let's translate: ;
            ctx.rotate(Math.PI / 180 * imageAngle); //increment the angle and rotate the image 
            ctx.translate(-(imageX + imageWidth / 2), -(imageY + imageHeight / 2)); //let's translate

            let p = imageX + imageWidth / 2;
            let q = imageY + imageHeight / 2;

            const radAngle = Math.PI / 180 * imageAngle;

            // top-left
            var imageXAfterRotate = (imageX - p) * Math.cos(radAngle) - (imageY - q) * Math.sin(radAngle) + p;
            var imageYAfterRotate = (imageX - p) * Math.sin(radAngle) + (imageY - q) * Math.cos(radAngle) + q;

            // draw the image
            ctx.drawImage(
                img,
                0,
                0,
                img.width,
                img.height,
                imageX,
                imageY,
                imageWidth,
                imageHeight
            );

            // console.log(imageX, imageY, imageWidth, imageHeight);


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
                drawDragAnchor(imageX, imageY);
                drawDragAnchor(imageRight, imageY);
                drawDragAnchor(imageRight, imageBottom);
                drawDragAnchor(imageX, imageBottom);
                // drawDragAnchor(imageX, (imageBottom + imageY) / 2, ctx);
                // drawDragAnchor(imageRight, (imageBottom + imageY) / 2, ctx);
                drawDragLine(imageX, (imageBottom + imageY) / 2);
                drawDragLine(imageRight, (imageBottom + imageY) / 2);
                drawDragLine(imageX + (imageRight - imageX) / 2, imageY - 5);
                drawDragLine(imageX + (imageRight - imageX) / 2, imageBottom - 5);
            }
            drawText();
            ctx.restore();
        }
        if (template) {
            ctx.drawImage(
                template,
                0,
                0,
                template.width,
                template.height,
                0,
                0,
                300,
                300
            );
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
        ctx.fillStyle = "#fff";
        ctx.arc(x, y, resizerRadius, 0, pi2, false);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#07c6d6";
        ctx.stroke();
    }

    function mouseOverBorders(x, y) {
        let p = imageX + imageWidth / 2;
        let q = imageY + imageHeight / 2;

        const radAngle = Math.PI / 180 * imageAngle;

        // top-left
        var tx0 = (imageX - p) * Math.cos(radAngle) - (imageY - q) * Math.sin(radAngle) + p;
        var ty0 = (imageX - p) * Math.sin(radAngle) + (imageY - q) * Math.cos(radAngle) + q;

        // top-right
        var tx1 = (imageRight - p) * Math.cos(radAngle) - (imageY - q) * Math.sin(radAngle) + p;
        var ty1 = (imageRight - p) * Math.sin(radAngle) + (imageY - q) * Math.cos(radAngle) + q;

        // bottom-left
        var bx0 = (imageX - p) * Math.cos(radAngle) - (imageBottom - q) * Math.sin(radAngle) + p;
        var by0 = (imageX - p) * Math.sin(radAngle) + (imageBottom - q) * Math.cos(radAngle) + q;

        // bottom-right
        var bx1 = (imageRight - p) * Math.cos(radAngle) - (imageBottom - q) * Math.sin(radAngle) + p;
        var by1 = (imageRight - p) * Math.sin(radAngle) + (imageBottom - q) * Math.cos(radAngle) + q;

        if (hitLine({ x0: tx0, y0: ty0, x1: bx0, y1: by0 }, x, y)) {
            console.log('hitline');
            document.body.style.cursor = "col-resize";
        } else if (hitLine({ x0: tx1, y0: ty1, x1: bx1, y1: by1 }, x, y)) {
            // console.log('outside of line');
            document.body.style.cursor = "col-resize";
        } else if (hitLine({ x0: tx0, y0: ty0, x1: tx1, y1: ty1 }, x, y)) {
            document.body.style.cursor = "ns-resize";
        } else if (hitLine({ x0: bx0, y0: by0, x1: bx1, y1: by1 }, x, y)) {
            document.body.style.cursor = "ns-resize";
        } else {
            document.body.style.cursor = "alias";
        }

        // if (
        //     (Math.abs(x - imageX) <= 2 &&
        //         y >= imageY &&
        //         y <= imageBottom &&
        //         withAnchors) ||
        //     (Math.abs(x - imageRight) <= 2 &&
        //         y >= imageY &&
        //         y <= imageBottom &&
        //         withAnchors)
        // ) {
        //     if (draggingResizer === -1) document.body.style.cursor = "col-resize";
        // } else if (
        //     Math.abs(y - imageY) <= 2 &&
        //     x >= imageX &&
        //     x <= imageRight &&
        //     withAnchors
        // ) {
        //     if (draggingResizer === -1) document.body.style.cursor = "ns-resize";
        // } else if (
        //     Math.abs(y - imageBottom) <= 2 &&
        //     x >= imageX &&
        //     x <= imageRight &&
        //     withAnchors
        // ) {
        //     if (draggingResizer === -1) document.body.style.cursor = "ns-resize";
        // } else {
        //     // if (draggingResizer === -1)
        //     document.body.style.cursor = "alias";
        // }
        switch (anchorHitTest(x, y)) {
            case 0:
                if (withAnchors) {
                    document.body.style.cursor = "nwse-resize";
                }
                break;
            case 1:
                if (withAnchors) document.body.style.cursor = "nesw-resize";
                break;
            case 2:
                if (withAnchors) document.body.style.cursor = "nwse-resize";
                break;
            case 3:
                if (withAnchors) document.body.style.cursor = "nesw-resize";
                break;
            default:
                // document.body.style.cursor='alias';
                break;
        }
        // console.log('hello > ', x, imageX, y, (imageBottom + imageY) / 2);
    }

    function borderHitText(x, y) {
        let p = imageX + imageWidth / 2;
        let q = imageY + imageHeight / 2;

        const radAngle = Math.PI / 180 * imageAngle;

        // top-left
        var tx0 = (imageX - p) * Math.cos(radAngle) - (imageY - q) * Math.sin(radAngle) + p;
        var ty0 = (imageX - p) * Math.sin(radAngle) + (imageY - q) * Math.cos(radAngle) + q;

        // top-right
        var tx1 = (imageRight - p) * Math.cos(radAngle) - (imageY - q) * Math.sin(radAngle) + p;
        var ty1 = (imageRight - p) * Math.sin(radAngle) + (imageY - q) * Math.cos(radAngle) + q;

        // bottom-left
        var bx0 = (imageX - p) * Math.cos(radAngle) - (imageBottom - q) * Math.sin(radAngle) + p;
        var by0 = (imageX - p) * Math.sin(radAngle) + (imageBottom - q) * Math.cos(radAngle) + q;

        // bottom-right
        var bx1 = (imageRight - p) * Math.cos(radAngle) - (imageBottom - q) * Math.sin(radAngle) + p;
        var by1 = (imageRight - p) * Math.sin(radAngle) + (imageBottom - q) * Math.cos(radAngle) + q;

        if (hitLine({ x0: tx0, y0: ty0, x1: bx0, y1: by0 }, x, y)) {
            return 4;
        } else if (hitLine({ x0: tx1, y0: ty1, x1: bx1, y1: by1 }, x, y)) {
            console.log('returning 5');

            return 5;
        } else if (hitLine({ x0: tx0, y0: ty0, x1: tx1, y1: ty1 }, x, y)) {
            return 6;
        } else if (hitLine({ x0: bx0, y0: by0, x1: bx1, y1: by1 }, x, y)) {
            return 7;
        } else {
            return -1;
        }
        // if (Math.abs(x - imageX) <= 2 && y >= imageY && y <= imageBottom) {
        //     return 4;
        // } else if (
        //     Math.abs(x - imageRight) <= 2 &&
        //     y >= imageY &&
        //     y <= imageBottom
        // ) {
        //     return 5;
        // } else if (Math.abs(y - imageY) <= 10 && withAnchors) {
        //     document.body.style.cursor = "ns-resize";
        //     return 6;
        // } else if (Math.abs(y - imageBottom) <= 2 && withAnchors) {
        //     document.body.style.cursor = "ns-resize";
        //     return 7;
        // } else {
        //     return -1;
        // }
    }

    function hitLine(line, mouseX, mouseY) {
        var linepoint = linepointNearestMouse(line, mouseX, mouseY);
        var dx = mouseX - linepoint.x;
        var dy = mouseY - linepoint.y;
        var distance = Math.abs(Math.sqrt(dx * dx + dy * dy));
        if (distance < 5) {
            // $hit.text("Inside the line");
            // draw(line,mouseX,mouseY,linepoint.x,linepoint.y);
            // console.log('hit line');
            return true;
        } else {
            // console.log('outside of line');
            return false;
        }
    }

    function linepointNearestMouse(line, x, y) {
        let lerp = function (a, b, x) { return (a + x * (b - a)); };
        var dx = line.x1 - line.x0;
        var dy = line.y1 - line.y0;
        var t = ((x - line.x0) * dx + (y - line.y0) * dy) / (dx * dx + dy * dy);
        var lineX = lerp(line.x0, line.x1, t);
        var lineY = lerp(line.y0, line.y1, t);
        return ({ x: lineX, y: lineY });
    };

    function anchorHitTest(x, y) {
        var dx, dy;

        let p = imageX + imageWidth / 2;
        let q = imageY + imageHeight / 2;

        const radAngle = Math.PI / 180 * imageAngle;

        // top-left
        // dx = x - imageX;
        // dy = y - imageY;
        var x1 = (imageX - p) * Math.cos(radAngle) - (imageY - q) * Math.sin(radAngle) + p;
        var y1 = (imageX - p) * Math.sin(radAngle) + (imageY - q) * Math.cos(radAngle) + q;

        // console.log('old x, y > ', imageX, imageY);
        // console.log('new x, y > ', x1, y1);
        dx = x - x1;
        dy = y - y1;
        if (dx * dx + dy * dy <= rr) {
            console.log("here matched");
            return 0;
        }
        // top-right
        // dx = x - imageRight;
        // dy = y - imageY;
        x1 = (imageRight - p) * Math.cos(radAngle) - (imageY - q) * Math.sin(radAngle) + p;
        y1 = (imageRight - p) * Math.sin(radAngle) + (imageY - q) * Math.cos(radAngle) + q;

        dx = x - x1;
        dy = y - y1;

        // console.log('old x, y > ', imageX, imageY);
        // console.log('new x, y > ', x1, y1);

        if (dx * dx + dy * dy <= rr) {
            return 1;
        }
        // bottom-right
        // dx = x - imageRight;
        // dy = y - imageBottom;
        x1 = (imageRight - p) * Math.cos(radAngle) - (imageBottom - q) * Math.sin(radAngle) + p;
        y1 = (imageRight - p) * Math.sin(radAngle) + (imageBottom - q) * Math.cos(radAngle) + q;

        dx = x - x1;
        dy = y - y1;

        // console.log('old x, y > ', imageX, imageY);
        // console.log('new x, y > ', x1, y1);
        if (dx * dx + dy * dy <= rr) {
            return 2;
        }
        // bottom-left
        // dx = x - imageX;
        // dy = y - imageBottom;
        x1 = (imageX - p) * Math.cos(radAngle) - (imageBottom - q) * Math.sin(radAngle) + p;
        y1 = (imageX - p) * Math.sin(radAngle) + (imageBottom - q) * Math.cos(radAngle) + q;

        dx = x - x1;
        dy = y - y1;

        // console.log('old x, y > ', imageX, imageY);
        // console.log('new x, y > ', x1, y1);
        if (dx * dx + dy * dy <= rr) {
            return 3;
        }
        return -1;
    }

    function hitImage(x, y) {
        return (
            x > imageX &&
            x < imageX + imageWidth &&
            y > imageY &&
            y < imageY + imageHeight
        );
    }

    // test if x,y is inside the bounding box of texts[textIndex]
    function hitText(x, y, textIndex) {
        var text = textinputs[textIndex];
        console.log(x, y);
        console.log(text);
        return (
            x >= text.x &&
            x <= text.x + text.width &&
            y >= text.y - text.height &&
            y <= text.y
        );
    }

    function handleMouseDown(e, offsetX, offsetY, img, mask) {
        startX = parseInt(e.clientX - offsetX + window.scrollX);
        startY = parseInt(e.clientY - offsetY + window.scrollY);

        // for (var i = 0; i < textinputs.length; i++) {
        //     if (hitText(startX, startY, i)) {
        //         // selectedTextIndex = i;
        //         setSelectedTextIndex(i);
        //     }
        // }

        draggingResizer = anchorHitTest(startX, startY);

        if (draggingResizer === -1) draggingResizer = borderHitText(startX, startY);

        console.log("dragging resizer > ", draggingResizer);

        draggingImage = draggingResizer < 0 && hitImage(startX, startY);

        if (hitImage(startX, startY)) {
            withAnchors = true;
            withBorders = true;
        } else if (draggingResizer < 0) {
            withAnchors = false;
            withBorders = false;
        }

        draw(img, mask);
        // drawText(ctx, text);
    }

    function handleMouseUp(e, img, mask) {
        draggingResizer = -1;
        draggingImage = false;
        prevXState = undefined;
        prevYState = undefined;
        // setSelectedTextIndex(-1);
        // draw(img, canvas, ctx);
        // drawText(ctx, text)
    }

    function handleMouseOut(e, img, mask) {
        handleMouseUp(e, img, mask);
    }

    function handleMouseMove(e, offsetX, offsetY, img, mask) {
        // console.log('mouse moving > ', draggingResizer, draggingImage);
        // draggingResizer = anchorHitTest(e.clientX - offsetX, e.clientX - offsetX);
        // console.log(offsetX, offsetY);
        // console.log(window.pageXOffset, window.pageYOffset);
        mouseOverBorders(
            e.clientX - offsetX - window.scrollX,
            e.clientY - offsetY + window.scrollY
        );
        if (
            hitImage(
                parseInt(e.clientX - offsetX - window.scrollX),
                parseInt(e.clientY - offsetY + window.scrollY)
            )
        ) {
            // draw(false, true, img, canvas, ctx);
            // withBorders = true;
            // console.log(canvasBgColor);
            if (!withBorders) {
                withBorders = true;

                // draw(img);
                // drawText(ctx, text);
            }
        } else {
            // console.log(canvasBgColor);

            // draw(false, false, img, canvas, ctx);
            if (!withAnchors && withBorders) {
                withBorders = false;
                // draw(img);
                // drawText(ctx, text);
            }
        }

        // let mouseX = parseInt(e.clientX - offsetX);
        // let mouseY = parseInt(e.clientY - offsetY);
        // console.log(parseInt(e.clientX - offsetX), parseInt(e.clientY - offsetY));

        if (draggingResizer > -1 && selectedTextIndex === -1) {
            // console.log("inside dragging resizer");
            // alert('dragging resizer');
            let mouseX = parseInt(e.clientX - offsetX - window.scrollX);
            let mouseY = parseInt(e.clientY - offsetY + window.scrollY);
            // console.log(mouseX, mouseY);

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
                            console.log("inside if");
                        } else if (mouseX < prevXState) {
                            imageX = imageX - Math.abs(prevXState - mouseX);
                            imageY = imageY - Math.abs(prevXState - mouseX);
                            imageWidth = imageRight - imageX;
                            imageHeight = imageBottom - imageY;
                            console.log("inside else");
                        }
                        prevXState = mouseX;
                        prevYState = mouseY;
                    }
                    console.log('case 0');
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
                            console.log("inside if asdf");
                        } else if (mouseX < prevXState) {
                            // imageX = imageX - Math.abs(prevXState - mouseX);
                            imageY = imageY + Math.abs(prevXState - mouseX);
                            imageWidth = mouseX - imageX;
                            imageHeight = imageBottom - imageY;
                            console.log("inside else");
                        }
                        prevXState = mouseX;
                        prevYState = mouseY;
                    }
                    console.log('case 1');
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
                            imageHeight =
                                imageBottom - imageY + Math.abs(mouseX - prevXState);
                            console.log("inside if");
                        } else if (mouseX < prevXState) {
                            imageWidth = imageRight - imageX - Math.abs(mouseX - prevXState);
                            imageHeight =
                                imageBottom - imageY - Math.abs(mouseX - prevXState);
                            console.log("inside else");
                        }
                        prevXState = mouseX;
                        prevYState = mouseY;
                    }
                    console.log('case 2');
                    break;
                case 3:
                    //bottom-left
                    // imageX = mouseX;
                    // imageWidth = imageRight - mouseX;
                    // imageHeight = mouseY - imageY;
                    if (prevXState === undefined) {
                        prevXState = mouseX;
                        prevYState = mouseY;
                        // imageX = mouseX;
                        // imageWidth = imageRight - mouseX;
                        // imageHeight = mouseY - imageY;
                    } else {
                        if (mouseX > prevXState) {
                            imageX = imageX + Math.abs(mouseX - prevXState);
                            // imageY = imageY + Math.abs(mouseX - prevXState);
                            imageWidth = imageRight - imageX;
                            imageHeight =
                                imageBottom - imageY - Math.abs(mouseX - prevXState);
                            console.log("inside if");
                        } else if (mouseX < prevXState) {
                            imageX = imageX - Math.abs(mouseX - prevXState);
                            imageWidth = imageRight - imageX;
                            imageHeight =
                                imageBottom - imageY + Math.abs(mouseX - prevXState);
                            console.log("inside else");
                        }
                        prevXState = mouseX;
                        prevYState = mouseY;
                    }
                    console.log('case 3');
                    break;
                case 4:
                    // left border
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
                            console.log("inside if");
                        } else if (mouseX < prevXState) {
                            imageX = imageX - Math.abs(prevXState - mouseX);
                            imageWidth = imageRight - imageX;
                            console.log("inside else");
                        }
                        prevXState = mouseX;
                        prevYState = mouseY;
                    }
                    console.log('case 4');
                    break;
                case 5:
                    // right border
                    if (prevXState === undefined) {
                        prevXState = mouseX;
                        prevYState = mouseY;
                        // imageX = mouseX;
                        imageWidth = imageRight - imageX;
                    } else {
                        if (mouseX > prevXState) {
                            // imageX = imageX + Math.abs(mouseX - prevXState);
                            imageWidth = imageRight - imageX + Math.abs(mouseX - prevXState);
                            // console.log("inside if");
                        } else if (mouseX < prevXState) {
                            // imageX = imageX - Math.abs(prevXState - mouseX);
                            imageWidth = imageRight - imageX - Math.abs(prevXState - mouseX);
                            // console.log("inside else");
                        }
                        prevXState = mouseX;
                        prevYState = mouseY;
                    }
                    console.log('case 5');
                    break;
                case 6:
                    // top border
                    if (prevXState === undefined) {
                        prevXState = mouseX;
                        prevYState = mouseY;
                        // imageX = mouseX;
                        imageHeight = imageBottom - imageY;
                    } else {
                        CalcWidthHeight(prevXState, prevYState, mouseX, mouseY, imageAngle, 6);
                        if (mouseY > prevYState) {
                            // imageX = imageX + Math.abs(mouseX - prevXState);
                            imageY = imageY + Math.abs(mouseY - prevYState);
                            imageHeight = imageBottom - imageY;
                            console.log("inside if");
                        } else if (mouseY < prevYState) {
                            // imageX = imageX - Math.abs(prevXState - mouseX);
                            imageY = imageY - Math.abs(mouseY - prevYState);
                            imageHeight = imageBottom - imageY;
                            console.log("inside else");
                        }
                        prevXState = mouseX;
                        prevYState = mouseY;
                    }
                    console.log('case 6');
                    break;
                case 7:
                    // bottom border
                    if (prevXState === undefined) {
                        prevXState = mouseX;
                        prevYState = mouseY;
                        // imageX = mouseX;
                        imageHeight = imageBottom - imageY;
                    } else {
                        if (mouseY > prevYState) {
                            imageHeight =
                                imageBottom - imageY + Math.abs(mouseY - prevYState);
                            console.log("inside if");
                        } else if (mouseY < prevYState) {
                            imageHeight =
                                imageBottom - imageY - Math.abs(mouseY - prevYState);
                            console.log("inside else");
                        }
                        prevXState = mouseX;
                        prevYState = mouseY;
                    }
                    console.log('case 7');
                    break;
                default:
                    break;
            }

            if (imageWidth < 25) {
                imageWidth = 25;
            }
            if (imageHeight < 25) {
                imageHeight = 25;
            }

            // set the image right and bottom
            imageRight = imageX + imageWidth;
            imageBottom = imageY + imageHeight;

            // redraw the image with resizing anchors
            draw(img, mask);
            // drawText(ctx, text);
        } else if (draggingImage && selectedTextIndex === -1) {
            console.log("inside dragging image");
            // imageClick = false;
            // alert('dragging image');

            let mouseX = parseInt(e.clientX - offsetX - window.scrollX);
            let mouseY = parseInt(e.clientY - offsetY + window.scrollY);

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
            draw(img, mask);
            // drawText(ctx, text);
        }

        // if (selectedTextIndex > -1) {
        //     console.log("selected text");
        //     let mouseX = parseInt(e.clientX - offsetX);
        //     let mouseY = parseInt(e.clientY - offsetY);

        //     var dx = mouseX - startX;
        //     var dy = mouseY - startY;
        //     startX = mouseX;
        //     startY = mouseY;

        //     // var tmpTextArray = [...text];
        //     var textObj = textinputs[selectedTextIndex];
        //     textObj.x += dx;

        //     textObj.y += dy;

        //     textinputs[selectedTextIndex] = textObj;
        //     // setText(tmpTextArray);

        //     draw(img);
        //     // drawText(ctx, tmpTextArray);
        // }
    }

    function drawText() {
        ctx.font = "10px Courier";
        ctx.fillStyle = '#000000';
        // ctx.fillText(`width - ${imageWidth}\nheight - ${imageHeight}`, imageX + 5, imageY + 10);

        ctx.font = "14px Courier";

        for (var i = 0; i < textinputs.length; i++) {
            var lines = textinputs[i].text.split("\n");
            // console.log("drawText > ", lines);

            let addBorderWidth = textinputs[i].hasBorder ? 1 : 0;
            let x = textinputs[i].x + addBorderWidth;
            let y = textinputs[i].y + addBorderWidth;

            // console.log('new x, y = ', x, y);
            
            // textarea.style.top = (canvas.offsetTop + (30 * textinputs.length)) + 'px';
            // textarea.style.left = (canvas.offsetLeft) + 'px';
            ctx.fillStyle = textinputs[i].color;
            ctx.font = textinputs[i].fontSize + "px " + textinputs[i].fontFamily;
            let multipyBy = 0;

            // x: canvas.offsetLeft + window.scrollX,
            // y: canvas.offsetTop - window.scrollY + 30 * textinputs.length,

            ctx.save();
            // ctx.textAlign = "center";
            // ctx.textBaseline = "middle";

            let metrics = ctx.measureText(textinputs[i].text);
            let fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
            let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
            let textareaHeight = textareaNodes[i].scrollHeight;
            let textareaWidth = textareaNodes[i].scrollWidth;
            let containerHeight = containerNodes[i].offsetHeight;
            let containerWidth = containerNodes[i].offsetWidth;
            let containerScrollHeight = containerNodes[i].scrollHeight;
            let containerScrollWidth = containerNodes[i].scrollWidth;

            console.log('container offset height, width, metrix width = ', containerNodes[i].offsetHeight, containerNodes[i].offsetWidth, metrics.width);
            console.log('container scroll height, width = ', containerScrollHeight, containerScrollWidth);
            console.log('textarea height, width > ', textareaHeight, textareaWidth);

            // ctx.fillStyle = 'gray';
            // ctx.fillRect(x, y, containerScrollWidth, containerScrollHeight);

            // Matrix transformation
            ctx.translate(x+containerScrollWidth/2, y+containerScrollHeight/2);
            ctx.rotate(textinputs[i].angle);
            ctx.translate(-(x+containerScrollWidth/2), -(y+containerScrollHeight/2));

            // Rotated rectangle
            // ctx.fillStyle = 'red';
            // ctx.fillRect(x, y, containerScrollWidth, containerScrollHeight);
            // ctx.fillStyle = 'green';

            // ctx.translate(
            //     x + metrics.width / 2,
            //     y + 100
            // );
            // // ctx.rotate(70 * Math.PI / 180);
            // ctx.rotate(textinputs[i].angle);
            // ctx.translate(
            //     -(x + metrics.width / 2),
            //     -(y + 100)
            // );

            // ctx.fillText(textinputs[i].text, x, y + fontHeight);

            for (var j = 0; j < lines.length; j++) {
                // ctx.fillText(lines[j], x - ctx.canvas.offsetLeft, (y - ctx.canvas.offsetTop - 5 + (16 * (j + 1))));
                // ctx.fillText(lines[j], x, (y + (14 * (j + 1))));
                // ctx.fillText(lines[j], 50, 50);


                ctx.fillText(
                    lines[j],
                    x, y + textinputs[i].fontSize + multipyBy * (textinputs[i].fontSize * 1.5)
                );


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
            ctx.restore();
        }
    }

    for (let txtareaIdx = 0; txtareaIdx < textareaNodes.length; txtareaIdx++) {
        textareaNodes[txtareaIdx].addEventListener("focus", function (e) {
            // focus
            textareaNodes[txtareaIdx].removeEventListener("focusout");
        });
        textareaNodes[txtareaIdx].addEventListener("focusout", function (e) {
            // focusout
            textareaNodes[txtareaIdx].removeEventListener("focus");
        });
        textareaNodes[txtareaIdx].addEventListener("input", function (e) {
            // input
        });
        textareaNodes[txtareaIdx].addEventListener("mousedown", (e) => {
            mouseDownOnTextArea = true;
            for (let i = 0; i < textareaNodes.length; i++) {
                if (textareaNodes[i].id === textareaNodes[txtareaIdx].id) {
                    console.log("matched > ", i);
                    selectedTextIndex = i;
                    textinputs[i].hasBorder = true;
                    containerNodes[i].style.border = "1px solid #07c6d6";
                } else {
                    textinputs[i].hasBorder = false;
                    containerNodes[i].style.border = "0px solid #07c6d6";
                    // textareaNodes[i].removeEventListener('mousedown');
                }
            }
            prevXState = undefined;
            prevYState = undefined;
            textareaNodes[txtareaIdx].style.cursor = "pointer";
        });
        textareaNodes[txtareaIdx].addEventListener("mouseup", (e) => {
            mouseDownOnTextArea = false;
            prevXState = undefined;
            prevYState = undefined;
            // textareaNodes[txtareaIdx].removeEventListener('mousemove');
            // textareaNodes[txtareaIdx].removeEventListener('mousedown');
        });
        textareaNodes[txtareaIdx].addEventListener("mouseover", (e) => {
            textareaNodes[txtareaIdx].style.cursor = "pointer";
        });
    }

    if (containerNodes.length > 0) {
        document.addEventListener("mousemove", function (e) {
            if (rotateClicked) {
                var mouseX = e.clientX,
                    mouseY = e.clientY;

                const angle = Math.atan2(
                    mouseY - containerCenter.y,
                    mouseX - containerCenter.x
                );

                for (let i = 0; i < containerNodes.length; i++) {
                    if (
                        parseInt(containerNodes[i].id.split("-")[1]) === selectedContainerId
                    ) {
                        containerNodes[i].style.transform = `rotate(${angle}rad)`;
                        textinputs[i].angle = angle;
                        console.log(
                            `text top: ${containerNodes[i].offsetTop}; text left: ${containerNodes[i].offsetLeft}`
                        );
                        let { left, top } = containerNodes[i].getBoundingClientRect();
                        console.log(`new text top: ${top}; new text left: ${left}`);
                        textinputs[i].x = left;
                        textinputs[i].y = top;
                        break;
                    }
                }
            } else {
                if (mouseDownOnTextArea) {
                    console.log("here");

                    dragTextarea(e);
                }
            }
        });

        document.addEventListener("mouseup", (e) => {
            rotateClicked = false;
            mouseDownOnTextArea = false;
            prevXState = undefined;
            prevYState = undefined;
            for (
                let txtareaIdx = 0;
                txtareaIdx < textareaNodes.length;
                txtareaIdx++
            ) {
                textareaNodes[txtareaIdx].removeEventListener(
                    "mousemove",
                    dragTextarea
                );
            }
            document.removeEventListener("mousemove", dragTextarea);
        });

        canvas.addEventListener("mousedown", (e) => {
            console.log("here");

            var mouseX = e.clientX - canvas.offsetLeft - document.scrollX,
                mouseY = e.clientY - canvas.offsetTop + document.scrollY;

            for (let i = 0; i < containerNodes.length; i++) {
                if (hitTestTextarea(mouseX, mouseY, containerNodes[i])) {
                    containerNodes[i].style.borderWidth = "1px";
                    selectedTextIndex = i;
                    mouseDownOnTextArea = true;
                } else {
                    containerNodes[i].style.borderWidth = "0px";
                }
            }
        });
    }

    function dragTextarea(e) {
        console.log("drag");
        if (mouseDownOnTextArea) {
            var mouseX = e.clientX - canvas.offsetLeft,
                mouseY = e.clientY - canvas.offsetTop;

            if (prevXState === undefined) {
                prevXState = mouseX;
                prevYState = mouseY;
            } else {
                var dx = mouseX - prevXState;
                var dy = mouseY - prevYState;
                prevXState = mouseX;
                prevYState = mouseY;



                let selectedContainer = containerNodes[selectedTextIndex];
                var newLeftOfTextarea = selectedContainer.offsetLeft + dx;
                var newTopOfTextarea = selectedContainer.offsetTop + dy;

                selectedContainer.style.top = newTopOfTextarea + "px";
                selectedContainer.style.left = newLeftOfTextarea + "px";

                console.log(
                    selectedContainer.offsetTop,
                    selectedContainer.offsetLeft,
                    selectedContainer.offsetWidth,
                    selectedContainer.offsetHeight
                );

                containerCenter = getCenter(selectedContainer);

                for (let i = 0; i < textinputs.length; i++) {
                    if (
                        textinputs[i].id.split("-")[1] ===
                        selectedContainer.id.split("-")[1]
                    ) {
                        // console.log('hello dx, dy = ', dx, dy);
                        let nx = parseInt(textinputs[i].x + dx);
                        let ny = parseInt(textinputs[i].y + dy);
                        textinputs[i].x = nx;
                        textinputs[i].y = ny;
                        // console.log('hello nx, ny = ', nx, ny, typeof textinputs[i].x, typeof textinputs[i].y);
                        // textinputs[i].cx = containerCenter.x;
                        // textinputs[i].cy = containerCenter.y;
                        break;
                    }
                }
            }

            // if (prevXState === undefined || prevYState === undefined) {
            //     prevXState = mouseX;
            //     prevYState = mouseY;
            // } else {
            //     let selectedContainer = containerNodes[selectedTextIndex];

            //     var dx = mouseX - prevXState;
            //     var dy = mouseY - prevYState;
            //     var newLeftOfTextarea = selectedContainer.offsetLeft + dx;
            //     var newTopOfTextarea = selectedContainer.offsetTop + dy;

            //     selectedContainer.style.top = newTopOfTextarea + "px";
            //     selectedContainer.style.left = newLeftOfTextarea + "px";
            //     prevXState = mouseX;
            //     prevYState = mouseY;
            //     console.log(
            //         selectedContainer.offsetTop,
            //         selectedContainer.offsetLeft,
            //         selectedContainer.offsetWidth,
            //         selectedContainer.offsetHeight
            //     );

            //     containerCenter = getCenter(selectedContainer);

            //     for (let i = 0; i < textinputs.length; i++) {
            //         if (
            //             textinputs[i].id.split("-")[1] ===
            //             selectedContainer.id.split("-")[1]
            //         ) {
            //             textinputs[i].x = newLeftOfTextarea;
            //             textinputs[i].y = newTopOfTextarea;
            //             textinputs[i].cx = containerCenter.x;
            //             textinputs[i].cy = containerCenter.y;
            //             break;
            //         }
            //     }
            // }
        }
    }

    function hitTestTextarea(mouseX, mouseY, element) {
        var taTopX = element.offsetLeft;
        var taTopY = element.offsetTop;
        var taRight = element.offsetWidth;
        var taBottom = element.offsetHeight;

        if (
            mouseX >= taTopX &&
            mouseX <= taRight &&
            mouseY >= taTopY &&
            mouseY <= taBottom
        ) {
            return true;
        }
        return false;
    }

    return {
        canvasRef,
        imageRef,
        templateRef,
        setSelectedImg,
        setSelectedTemplate,
        addTextArea,
        updateTextareaNode,
        updateTextareaAngle,
        updateImageAngle,
        drawTextForDownload,
        canvasBgColor,
        setCanvasBgColor,
        setTextColor,
        textColor,
        showToolbar,
        setShowToolbar,
    };
}

function getCenter(element) {
    const { left, top, width, height } = element.getBoundingClientRect();
    return { x: left + width / 2, y: top + height / 2 };
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
