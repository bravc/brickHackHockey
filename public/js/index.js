var pixelRatio = window.devicePixelRatio;
let devMode = true;

var canvas;
var ctx;
var timer;

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
}
else {
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
 	if (typeof stroke == "undefined" ) {
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

 function backingScale(context) {
 	if ('devicePixelRatio' in window) {
 		if (window.devicePixelRatio > 1) {
 			return window.devicePixelRatio;
 		}
 	}
 	return 1;
 }

 class Paddle {
 	constructor(x,y) {
 		this.x = x;
 		this.y = y;
 	}
 }

 var player1Paddle;

 var player2Paddle;


// Get the position of a touch relative to the canvas
function getTouchPos(canvasDom, touchEvent) {
  var rect = canvasDom.getBoundingClientRect();
  return {
    x: touchEvent.touches[0].clientX - rect.left,
    y: touchEvent.touches[0].clientY - rect.top
  };
}

 $(document).ready(function() {
 	canvas = document.getElementById("gameBoard");
 	ctx = canvas.getContext("2d");

 	scaleCanvas(canvas, ctx, $("body").width() * (14/16), $("body").height() * (15/16));

 	player1Paddle = new Paddle(canvas.width / devicePixelRatio / 2, canvas.height / devicePixelRatio - 100);

 	player2Paddle = new Paddle(canvas.width / devicePixelRatio / 2, 100);

 	if(devMode){
 		$("#blur").hide();
 	}

 	timer=setInterval(drawHockeyRink, 10);


 	 // Set up touch events for mobile, etc
 	 canvas.addEventListener("touchstart", function (e) {
 	 	mousePos = getTouchPos(canvas, e);
 	 	//var touch = e.touches[0];
 	 	//var mouseEvent = new MouseEvent("mousedown", {
 	 		//clientX: touch.clientX,
 	 		//clientY: touch.clientY
 	 	//});
 	 	//canvas.dispatchEvent(mouseEvent);
 	 }, false);
 	 canvas.addEventListener("touchend", function (e) {
 	 	//var mouseEvent = new MouseEvent("mouseup", {});
 	 	//canvas.dispatchEvent(mouseEvent);
 	 }, false);
 	 canvas.addEventListener("touchmove", function (e) {
 	 	var touch = e.touches[0];
 	 	player1Paddle.x = touch.clientX
 	 	player1Paddle.y = touch.clientY;

 	 }, false);



 	});


 function drawHockeyRink(){

 	// draw in arena

 	//white background
 	ctx.strokeStyle = "rgb(255, 0, 0)";
 	ctx.fillStyle = "#FFFFFF";
 	roundRect(ctx, 2, 2, canvas.width / devicePixelRatio - 4, canvas.height / devicePixelRatio - 4, 20, true, true);


 	ctx.fillStyle = "#000000";


	//player 1 paddle
	ctx.beginPath();
	ctx.arc(player1Paddle.x, player1Paddle.y, 40, 0, 2 * Math.PI);
	ctx.fill();

	//player 2 paddle
	ctx.beginPath();
	ctx.arc(player2Paddle.x, player2Paddle.y, 40, 0, 2 * Math.PI);
	ctx.fill();
}




function resizeCanvas(){
	var canvas = document.getElementById("gameBoard");
	var newSize = canvas.height / (16/22);
 	//canvas.width = newSize;
 }

//make sure the canvas stays at 16:9
$(window).resize(function(){
	resizeCanvas();
});





