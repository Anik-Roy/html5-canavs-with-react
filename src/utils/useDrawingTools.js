export function useDrawingTools() {
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

    function draw(withAnchors, withBorders, img, canvas, ctx) {
        // clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        imageWidth = img.width;
        imageHeight = img.height;
        imageRight = imageX + imageWidth;
        imageBottom = imageY + imageHeight;

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

    function drawText(ctx, text) {
        ctx.font = "40px Courier";
        ctx.fillStyle = '#ffffff';

        var lines = text.split('\n');
        let x = 50;
        let y = 50;

        for (var i = 0; i < lines.length; i++)
            ctx.fillText(lines[i], x, y + (i * y));
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

    function handleMouseDown(e, offsetX, offsetY, canvas, ctx, img, text) {
        startX = parseInt(e.clientX - offsetX);
        startY = parseInt(e.clientY - offsetY);
        console.log('start x y > ', startX, startY);
        draggingResizer = anchorHitTest(startX, startY);
        console.log('draggingResizer > ', draggingResizer);
        draggingImage = draggingResizer < 0 && hitImage(startX, startY);
        console.log('offset x, y > ', canvas.offsetLeft, canvas.offsetTop);
    }

    function handleMouseUp(e, canvas, ctx, img, text) {
        draggingResizer = -1;
        draggingImage = false;
        draw(true, false, img, canvas, ctx);
        drawText(ctx, text);
    }

    function handleMouseOut(e, canvas, ctx, img, text) {
        handleMouseUp(e, canvas, ctx, img, text);
    }

    function handleMouseMove(e, offsetX, offsetY, canvas, ctx, img, text) {
        console.log('mouse moving > ', draggingResizer, draggingImage);
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
            drawText(ctx, text);

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
            drawText(ctx, text);
        }
    }

    return {
        draw,
        drawText,
        anchorHitTest,
        hitImage,
        handleMouseDown,
        handleMouseUp,
        handleMouseOut,
        handleMouseMove
    };
}