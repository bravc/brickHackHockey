var pixelRatio = window.devicePixelRatio;
const socketUrl = "/" 
const socket = io();

$(document).ready(function() {
    var canvas = document.getElementById("gameBoard");
    canvas.getContext('2d').scale(pixelRatio,pixelRatio);
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(0,0,150,75);
	resizeCanvas();
});

socket.on('connect', function(){
	console.log('Connected...'); 
});



function resizeCanvas(){
	var newSize = $('#gameBoard').height() / (16/22) / (pixelRatio);
	$('#gameBoard').width(newSize);
}

//make sure the canvas stays at 16:9
$(window).resize(function(){
   resizeCanvas();
});




							
