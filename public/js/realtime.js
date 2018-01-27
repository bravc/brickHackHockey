var socUrl = "/"
let soc = io();


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
        if(roomExists === ""){
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
        soc.emit("ADD_ROOM", displayRoomID);
    });

    /**
     * When join button clicked,
     * check if if input was not empty
     * and then tell the server to join the
     * room
     */
    joinBtn.on('click', function(){
        if(roomID.val() != ''){
            soc.emit("CONNECT_ROOM", roomID.val(), hideForm);
        }else{
            alert("User does not exist!")
        }
    });
    soc.on('connect', function(){
        console.log('Connected...');
    });

    /**
     * When both parties have joined,
     * hide the menu
     */
    soc.on("ENTER_GAME", function(){
        blur.hide();
    });

    soc.on("OPPONENT_PUCK_MOVE", function(x, y){
        player2Paddle.setPos(x, y);
    });

    soc.on("EXIT_ROOM", function(){
        alert("User left!");
        blur.show();
    });

});
