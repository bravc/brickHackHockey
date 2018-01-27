const socketUrl = "/" 
const socket = io();



$(document).ready(function() {

    let roomID = $('#roomID'),
        createBtn = $('#createRoomButton'),
        joinBtn = $('#roomEnterButton'),
        display = $('#currRoomID');



    displayRoomID = (roomID) => {
        console.log("Got here");
        
        display.text(roomID);
    }

    createBtn.on('click', function(){
        socket.emit("ADD_ROOM", displayRoomID);
    });

    joinBtn.on('click', function(){        
        if(roomID.val() != ''){
            socket.emit("CONNECT_ROOM", roomID.val())
        }else{  
            alert("User does not exist!")
        }
    });

    socket.on('connect', function(){
        console.log('Connected...'); 
    });


    
});