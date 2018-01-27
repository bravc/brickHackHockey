let pixelRatio = window.devicePixelRatio;
let devMode = true;

//const socket = require('./realtime');

let canvas;
let ctx;
let timer;
let player1Paddle;
let player2Paddle;
let puck;

//makes the canvas scale right for retina devices
function scaleCanvas(canvas, context, width, height) {
    // assume the device pixel ratio is 1 if the browser doesn't specify it
    const devicePixelRatio = window.devicePixelRatio || 1;

    // determine the 'backing store ratio' of the canvas context
    const backingStoreRatio = (
        context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1
    );

    // determine the actual ratio we want to draw at
    const ratio = devicePixelRatio / backingStoreRatio;

    if (devicePixelRatio !== backingStoreRatio) {
        // set the 'real' canvas size to the higher width/height
        canvas.width = width * ratio;
        canvas.height = height * ratio;

        // ...then scale it back down with CSS
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
    } else {
        // this is a normal 1:1 device; just scale it simply
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = '';
        canvas.style.height = '';
    }

    // scale the drawing context so everything will work at the higher ratio
    context.scale(ratio, ratio);
}


/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} radius The corner radius. Defaults to 5;
 * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
 * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == "undefined") {
        stroke = true;
    }
    if (typeof radius === "undefined") {
        radius = 5;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (stroke) {
        ctx.stroke();
    }
    if (fill) {
        ctx.fill();
    }
}


//get the proper scale for all retina devices
function backingScale(context) {
    if ('devicePixelRatio' in window) {
        if (window.devicePixelRatio > 1) {
            return window.devicePixelRatio;
        }
    }
    return 1;
}


//represents a paddle
class Paddle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 40;
    }
    setX(x){
    	this.x = x;
    }
    setY(y){
    	if(y < canvas.height / devicePixelRatio / 2){
    		y = canvas.height / devicePixelRatio / 2 - radius;
    	}
    	this.y = y;
    }
}

//represents the puck
class Puck {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15;
    }
    setX(x){
    	this.x = x;
    }
    setY(y){
    	this.y = y;
    }
}




// Get the position of a touch relative to the canvas
function getTouchPos(canvasDom, touchEvent) {
    let rect = canvasDom.getBoundingClientRect();
    return {
        x: touchEvent.touches[0].clientX - rect.left,
        y: touchEvent.touches[0].clientY - rect.top
    };
}

$(document).ready(function() {
    canvas = document.getElementById("gameBoard");
    ctx = canvas.getContext("2d");

    conn.emit("hello");

    //scale the canvas properly
    scaleCanvas(canvas, ctx, aspectRatio()[0], aspectRatio()[1]);

    //make the player 1 paddle
    player1Paddle = new Paddle(canvas.width / devicePixelRatio / 2, canvas.height / devicePixelRatio - 100);

    //make the opponent paddle
    player2Paddle = new Paddle(canvas.width / devicePixelRatio / 2, 100);

    //puck
    puck = new Puck(canvas.width / devicePixelRatio / 2, canvas.height / devicePixelRatio / 2);

    //hide the login form inititally
    if (devMode) {
        $("#blur").hide();
    }


    //start the canvas updates
    timer = setInterval(drawHockeyRink, 1);


    // Set up touch events for mobile, etc
    canvas.addEventListener("touchstart", function(e) {
        mousePos = getTouchPos(canvas, e);
        e.preventDefault();
    }, false);
    canvas.addEventListener("touchend", function(e) {
        //let mouseEvent = new MouseEvent("mouseup", {});
        //canvas.dispatchEvent(mouseEvent);
    }, false);
    canvas.addEventListener("touchmove", function(e) {
        let touch = e.touches[0];
        player1Paddle.setX(touch.clientX);
        player1Paddle.setY(touch.clientY);

    }, false);

});

function aspectRatio() {
    let width = $("body").width();
    let height = $("body").height();
    let ratio = width / height;

    let destinationRatio = 94 / 100;

    if (ratio == destinationRatio) {
        return [width, height];
    } else if (ratio > destinationRatio) {
        width = width * destinationRatio;
        return [width, height];
    } else if (ratio < destinationRatio) {
        height = height * destinationRatio;
        return [width, height];
    }
}


function drawHockeyRink() {

    // draw in arena

    //white background
    ctx.strokeStyle = "rgb(255, 0, 0)";
    ctx.fillStyle = "#FFFFFF";
    roundRect(ctx, 2, 2, canvas.width / devicePixelRatio - 4, canvas.height / devicePixelRatio - 4, 20, true, true);


    //paddle color
    ctx.fillStyle = "#000000";

    //player 1 paddle
    ctx.beginPath();
    ctx.arc(player1Paddle.x, player1Paddle.y, player1Paddle.radius, 0, 2 * Math.PI);
    ctx.fill();

    //player 2 paddle
    ctx.beginPath();
    ctx.arc(player2Paddle.x, player2Paddle.y, player2Paddle.radius, 0, 2 * Math.PI);
    ctx.fill();

    //puck
    ctx.beginPath();
    ctx.arc(player2Paddle.x, player2Paddle.y, player2Paddle.radius, 0, 2 * Math.PI);
    ctx.fill();
}




function resizeCanvas() {
    let canvas = document.getElementById("gameBoard");
    let newSize = canvas.height / (16 / 22);
    //canvas.width = newSize;
}

//make sure the canvas stays at 16:9
$(window).resize(function() {
    resizeCanvas();
});