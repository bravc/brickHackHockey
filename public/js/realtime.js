const socketUrl = "/"
const socket = io();



$(document).ready(function() {

    let roomID = $('#roomID'),
        createBtn = $('#createRoomButton'),
        joinBtn = $('#roomEnterButton'),
        display = $('#currRoomID'),
        blur = $('#blur');



    displayRoomID = (roomID) => {
        console.log("Got here");

        display.text(roomID);
    }

    hideForm = (roomExists) => {
        if(roomExists === ''){
            blur.hide();
        }else{
            alert(roomExists);
            roomID.attr('value', '');
        }
    }

    createBtn.on('click', function(){
        socket.emit("ADD_ROOM", displayRoomID);
    });

    joinBtn.on('click', function(){
        if(roomID.val() != ''){
            socket.emit("CONNECT_ROOM", roomID.val(), hideForm);
        }else{
            alert("User does not exist!")
        }
    });

    socket.on('connect', function(){
        console.log('Connected...');
    });

    socket.on("ENTER_GAME", function(){
        blur.hide();
    });

});
