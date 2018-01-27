const socketUrl = "/" 
const socket = io();



$(document).ready(function() {

    let roomID = $('#roomID'),
        createBtn = $('#createRoomButton'),
        joinBtn = $('#roomEnterButton');


    createBtn.on('click', function(){
        socket.emit("ADD_ROOM");
    });

    joinBtn.on('click', function(){        
        if(roomID.val() != ''){
            socket.emit("ROOM_CONNECT", )
        }else{  
            alert("User does not exist!")
        }
    });

    socket.on('connect', function(){
        console.log('Connected...'); 
    });


    
});