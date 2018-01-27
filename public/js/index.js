var pixelRatio = window.devicePixelRatio;

$(document).ready(function() {
    var canvas = document.getElementById("gameBoard");
    canvas.getContext('2d').scale(pixelRatio,pixelRatio);
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "#FF0000";
	ctx.fillRect(0,0,150,75);
});


//make sure the canvas stays at 16:9
$(window).resize(function(){
   $('#gameBoard').width($('#gameBoard').height() / (9/16));
});


