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

 $(document).ready(function() {
 	canvas = document.getElementById("gameBoard");
 	ctx = canvas.getContext("2d");

 	scaleCanvas(canvas, ctx, $("body").width() * (14/16), $("body").height() * (15/16));



	if(devMode){
		$("#blur").hide();
	}

	timer=setInterval(drawHockeyRink, 10);
});


 function drawHockeyRink(){
 	// Draw using default border radius,
	// stroke it but no fill (function's default values)
	ctx.strokeStyle = "rgb(255, 0, 0)";
	ctx.fillStyle = "#FFFFFF";
	roundRect(ctx, 2, 2, canvas.width / devicePixelRatio - 4, canvas.height / devicePixelRatio - 4, 20, true, true);
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
