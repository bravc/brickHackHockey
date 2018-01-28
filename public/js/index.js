let pixelRatio = window.devicePixelRatio;
let devMode = true;

const updateTime = 1/6*100;
const minVelocity = 300;

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
        this.mass = 1;
        this.isColiding = false;
    }


    setScore(){
        this.score++;
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
        this.xIsColiding = false;
        this.yIsColiding = false;
        this.acceleration = 0.005;
        this.radius = 15;
        this.mass = 0.2;
    }
	setPosition(x,y){
		if(this.x + this.radius >= canvas.width / devicePixelRatio && this.xIsColiding == false){
			this.vX = -this.vX;
			x -= 10;
			this.xIsColiding = true;
		} else if(this.x - this.radius <= 0 && this.xIsColiding == false){
			this.vX = -this.vX;
			x += 10;
			this.xIsColiding = true;
		} else {
			this.xIsColiding = false;
		}

		if(this.y >= canvas.height / devicePixelRatio && this.yIsColiding == false){
			this.vY = -this.vY;
			y -= 10;
			this.yIsColiding = true;
		} else if(this.y <= 0 && this.yIsColiding == false){

            //Goal scored and puck replaced at center ice
            if(this.x > ((canvas.width / devicePixelRatio / 4) + 5)
                && this.x < ((canvas.width / devicePixelRatio * 3 / 4) - 5)){
                    player1Paddle.setScore();
                    this.vY = 0;
                    this.vX = 0;
                    y = canvas.height / devicePixelRatio / 2;
                    x = canvas.width / devicePixelRatio / 2;
            } else {
                this.vY = -this.vY;
                y += 10;
                this.yIsColiding = true;
            }

		} else {
			this.yIsColiding = false;
		}
		this.x = x;
		this.y = y;

        //puck collision detection with paddle 1
        let player1Dx = puck.x - player1Paddle.x;
        let player1Dy = puck.y - player1Paddle.y;
        let player1Radii = puck.radius + player1Paddle.radius;
        if ( ( player1Dx * player1Dx )  + ( player1Dy * player1Dy ) < player1Radii * player1Radii){
            if(!player1Paddle.isColiding){
                let vX = (player1Paddle.x - player1Paddle.previousX) / (updateTime * 1000);
                let vY = (player1Paddle.y - player1Paddle.previousY) / (updateTime * 1000);
                puck.vX = vX * 10000;
                puck.vY = vY * 10000;
            }
            player1Paddle.isColiding = true;
        } else {
            player1Paddle.isColiding = false;
        }

        //puck collision detection
        let player2Dx = puck.x - player2Paddle.x;
        let player2Dy = puck.y - player2Paddle.y;
        let player2Radii = puck.radius + player2Paddle.radius;
        if ( ( player2Dx * player2Dx )  + ( player2Dy * player2Dy ) < player2Radii * player2Radii ){
            if(!player2Paddle.isColiding){
                let vX = (player2Paddle.x - player2Paddle.previousX) / (updateTime * 1000);
                let vY = (player2Paddle.y - player2Paddle.previousY) / (updateTime * 1000);
                puck.vX = vX * 10000;
                puck.vY = vY * 10000;
            }
            player2Paddle.isColiding = true;
        } else {
            player2Paddle.isColiding = false;
        }
	}
    updatePosition(){

        this.setPosition(this.x + this.vX, this.y + this.vY);

	    //this acceleration calculations
	    if(this.vX > 0){
            if(this.vX - this.acceleration > minVelocity){
                this.vX -= this.acceleration;
            }
        }
	    else if(this.vX < 0){
            if(this.vX + this.acceleration > -minVelocity){
	    	  this.vX += this.acceleration;
            }
        }

	    if(this.vY > 0){
            if(this.vY - this.acceleration > minVelocity){
                this.vY -= this.acceleration;
            }
	    } else if(this.vY < 0){
            if(this.vY + this.acceleration > -minVelocity){
                this.vY += this.acceleration;
            }
        }
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
    ctx.strokeStyle = "#0000FF";
    ctx.fillStyle = "#000000";
    ctx.lineWidth = 4;
    roundRect(ctx, 2, 2, normalizedWidth - 4, normalizedHeight - 4, 25, true, true);

    let goalStart = normalizedWidth / 4;
    let goalEnd = normalizedWidth / 4 * 3;


    //goal line color
    ctx.strokeStyle = "#FFFFFF";


    //player 1 goal line
    ctx.beginPath();
    ctx.moveTo(goalStart, normalizedHeight);
    ctx.lineTo(goalEnd, normalizedHeight);
    ctx.stroke();
    ctx.closePath();

    //player 2 goal line
    ctx.beginPath();
    ctx.moveTo(goalStart, 0);
    ctx.lineTo(goalEnd, 0);
    ctx.stroke();
    ctx.closePath();

    ctx.strokeStyle = "FF0000";
    ctx.lineWidth = 4;

    //center-ice Circle
    ctx.beginPath();
    ctx.arc(normalizedWidth / 2, normalizedHeight / 2, normalizedWidth / 4, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();

    //centerline color and width
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 4;

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
	ctx.fillStyle = "#FFFFFF"; //score font color
	ctx.fillText(player1Paddle.score.toString(), normalizedHeight / 2 + 20, 10); //player 1
	ctx.fillText(player2Paddle.score.toString(), normalizedHeight / 2 - 20, 10); //player 2
	ctx.restore();

    //paddle color
    ctx.fillStyle = "#3498db";

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
    ctx.fillStyle = "#ff4757";

    //puck
    ctx.beginPath();
    ctx.arc(puck.x, puck.y, puck.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();

    puck.updatePosition();
    if(typeof otherWidth == 'undefined' && !devMode)
        StackBlur.canvasRGB(canvas, 0, 0, canvas.width, canvas.height, 120);
}
