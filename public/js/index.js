let pixelRatio = window.devicePixelRatio;
let devMode = false;

const updateTime = 1/6*100;

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
    constructor(x, y, player) {
        this.x = x;
        this.y = y;
        this.previousX = x;
        this.previousY = y;
        this.player = player;
        this.radius = 40;
        this.score = 0;
    }
    setPos(x, y){
		if(this.player == 1){
			this.previousX = this.x;
			this.previousY = this.y;


			if(x > canvas.width / devicePixelRatio - this.radius - 2){
    			x = canvas.width / devicePixelRatio - this.radius - 2;
	    	}
	    	else if(x < this.radius + 2){
	    		x = this.radius + 2;
	    	}

	    	this.x = x;

	    	if(y < canvas.height / devicePixelRatio / 2 + this.radius){
	    		y = canvas.height / devicePixelRatio / 2 + this.radius;
	    	}
			else if(y > canvas.height / devicePixelRatio - this.radius - 2){
	    		y = canvas.height / devicePixelRatio - this.radius - 2;
	    	}

			this.y = y;

			//puck collision detection
			let dx = puck.x - this.x;
			let dy = puck.y - this.y;
			let radii = puck.radius + this.radius;
			if ( ( dx * dx )  + ( dy * dy ) < radii * radii ){
				console.log("Collision");
			}

			soc.emit("MOVE_PADDLE", x, y);
		} else {
			let xRatio = canvas.width / devicePixelRatio / otherWidth;
			let yRatio = canvas.height / devicePixelRatio / otherHeight;
			this.x = (otherWidth - x) * xRatio;
			this.y = (otherHeight - y) * yRatio;
		}
    }
}

//represents the puck
class Puck {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vX = 0;
        this.vY = 0;
        this.acceleration = -0.2;
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

    //scale the canvas properly
    scaleCanvas(canvas, ctx, aspectRatio()[0], aspectRatio()[1]);

    //make the player 1 paddle
    player1Paddle = new Paddle(canvas.width / devicePixelRatio / 2, canvas.height / devicePixelRatio - 100, 1);

    //make the opponent paddle
    player2Paddle = new Paddle(canvas.width / devicePixelRatio / 2, 100, 2);

    //puck
    puck = new Puck(canvas.width / devicePixelRatio / 2, canvas.height / devicePixelRatio / 2);

    //hide the login form inititally
    if (devMode) {
        $("#blur").hide();
    }


    //start the canvas updates
    timer = setInterval(drawHockeyRink, updateTime);


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
        player1Paddle.setPos(touch.clientX, touch.clientY);

    }, false);

});

function aspectRatio() {
    let width = $("body").width();
    let height = $("body").height();
    let ratio = width / height;

    let destinationRatio = 96 / 100;

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

	let normalizedWidth = canvas.width / devicePixelRatio;
	let normalizedHeight = canvas.height / devicePixelRatio;

    //draw in arena

    //white background
    ctx.strokeStyle = "#FF0000";
    ctx.fillStyle = "#FFFFFF";
    ctx.lineWidth = 4;
    roundRect(ctx, 2, 2, normalizedWidth - 4, normalizedHeight - 4, 25, true, true);

    let goalStart = normalizedWidth / 4;
    let goalEnd = normalizedWidth / 4 * 3;


    //goal line color
    ctx.strokeStyle = "#FFFFFF";


    //player 1 goal line
    ctx.beginPath();
    ctx.moveTo(goalStart, normalizedHeight - 2);
    ctx.lineTo(goalEnd, normalizedHeight - 2);
    ctx.stroke();
    ctx.closePath();

    //player 2 goal line
    ctx.beginPath();
    ctx.moveTo(goalStart, 0);
    ctx.lineTo(goalEnd, 0);
    ctx.stroke();
    ctx.closePath();


    //centerline color and width
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 2;

    //centerline
    ctx.beginPath()
    ctx.moveTo(0, normalizedHeight / 2);
    ctx.lineTo(normalizedWidth, normalizedHeight / 2);
    ctx.stroke();
    ctx.closePath();


    //scores
    ctx.save();
	ctx.translate(normalizedWidth - 20, 0);
	ctx.rotate(Math.PI/2);
	ctx.textAlign = "center";
	ctx.font = "30px Arial";
	ctx.fillStyle = "#000000"; //score font color
	ctx.fillText(player1Paddle.score.toString(), normalizedHeight / 2 - 20, 10); //player 1
	ctx.fillText(player2Paddle.score.toString(), normalizedHeight / 2 + 20, 10); //player 2
	ctx.restore();

    //paddle color
    ctx.fillStyle = "#000000";

    //player 1 paddle
    ctx.beginPath();
    ctx.arc(player1Paddle.x, player1Paddle.y, player1Paddle.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();

    //player 2 paddle
    ctx.beginPath();
    ctx.arc(player2Paddle.x, player2Paddle.y, player2Paddle.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();

    //puck color
    ctx.fillStyle = "blue";

    //puck
    ctx.beginPath();
    ctx.arc(puck.x, puck.y, puck.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();

    //puck velocity calculations
    puck.x += puck.vX;
    puck.y += puck.vY;

    //puck acceleration calculations
    puck.Vx += puck.acceleration;
    puck.Vy += puck.acceleration;
}
