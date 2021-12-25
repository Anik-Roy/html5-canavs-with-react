var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var mouseX = 0;
var mouseY = 0;
var startingX = 0;

// a function called when mouse clicked on canvas
canvas.addEventListener('click', function (e) {
    // get clicked position to write text
    mouseX = e.pageX - canvas.offsetLeft;
    mouseY = e.pageY - canvas.offsetTop;
    startingX = mouseX;
    return false;
}, false);

// add keydown event to document
document.addEventListener('keydown', function (e) {
    // set canvas font
    context.font = '16px Arial';

    // write text to canvas
    context.fillText(e.key, mouseX, mouseY);
}, false);