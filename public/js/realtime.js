const socketUrl = "/" 
const socket = io();



socket.on('connect', function(){
	console.log('Connected...'); 
});