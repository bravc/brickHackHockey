var socUrl = "/"
let soc = io();


$(document).ready(function() {

    let roomID = $('#roomID'),
        createRoom = $('#createRoom');
        createBtn = $('#createRoomButton'),
        joinBtn = $('#roomEnterButton'),
        display = $('#currRoomID'),
        blur = $('#blur');


    let gameboard = document.getElementById('gameBoard');

    let otherWidth,
        otherHeight;

    /**
     * Displays the created roomID on the page to give to friends
     */
    displayRoomID = (roomID) => {
        console.log("Got here");

        display.text("Waiting for other player in room: " + roomID);
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
        let roomName = createRoom.val();
        if(roomName != ''){
            soc.emit("ADD_ROOM", roomName, displayRoomID);
        }
    });

    /**
     * When join button clicked,
     * check if if input was not empty
     * and then tell the server to join the
     * room
     */
    joinBtn.on('click', function(){
        if(roomID.val() != ''){
            soc.emit("CONNECT_ROOM", roomID.val(), gameboard.width, gameboard.height, hideForm );
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
    soc.on("ENTER_GAME", function(width, height){
        otherHeight = height;
        otherWidth = width;
        console.log("Other players canvas " + width + height);

        soc.emit("SEND_CANVAS", gameboard.width, gameboard.height);
        blur.hide();
    });

    /**
     * Update screen for opponent movement
     */
    soc.on("OPPONENT_PADDLE_MOVE", function(x, y){
        player2Paddle.setPos(x, y);
    });

    /**
     * Alert user that other player left
     */
    soc.on("EXIT_ROOM", function(){
        alert("User left!");
        blur.show();
    });

    /**
     * Exchange player canvas sizes
     */
    soc.on("PLAYER1_CANVAS", function(width, height){
        otherHeight = height;
        otherWidth = width;
        console.log("Other players canvas " + width + height);
    });


    soc.on("PLAYER1_SCORE", function(){
        //update player 1 score
    });

    soc.on("PLAYER2_SCORE", function(){
        //update player 2 score
    });

});
