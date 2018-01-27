const socketUrl = "/"
const socket = io();



$(document).ready(function() {

    let roomID = $('#roomID'),
        createBtn = $('#createRoomButton'),
        joinBtn = $('#roomEnterButton'),
        display = $('#currRoomID'),
        blur = $('#blur');

    /**
     * Displays the created roomID on the page to give to friends
     */
    displayRoomID = (roomID) => {
        console.log("Got here");

        display.text(roomID);
    }

    /**
     * Callback used by server to either hide div or alert of error
     */
    hideForm = (roomExists) => {
        if(roomExists === ''){
            blur.hide();
        }else{
            alert(roomExists);
            roomID.attr('value', '');
        }
    }

    /**
     * When the create room button is clicked
     * tell the server to make a new room and
     * then display it
     */
    createBtn.on('click', function(){
        socket.emit("ADD_ROOM", displayRoomID);
    });

    /**
     * When join button clicked,
     * check if if input was not empty
     * and then tell the server to join the
     * room
     */
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

    /**
     * When both parties have joined,
     * hide the menu
     */
    socket.on("ENTER_GAME", function(){
        blur.hide();
    });

});
