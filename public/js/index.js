$(document).ready(function() {
    var canvas = document.getElementById("gameBoard");
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "#FF0000";
	ctx.fillRect(0,0,150,75);
});

$(window).resize(function(){
   $('#gameBoard').height($('#gameBoard').width() / (9/16));
});
