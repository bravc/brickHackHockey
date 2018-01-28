var socUrl = "/"
let soc = io();
let otherWidth, otherHeight;

let clientNumber;


$(document).ready(function() {

    let roomID = $('#roomID'),
        createRoom = $('#createRoom');
        createBtn = $('#createRoomButton'),
        joinBtn = $('#roomEnterButton'),
        display = $('#currRoomID'),
        blur = $('#blur');


    let gameboard = document.getElementById('gameBoard');

    /**
     * Displays the created roomID on the page to give to friends
     */
    displayRoomID = (roomID) => {
        console.log("Got here");

        display.html("Waiting for other player in room: <br>" + roomID);
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
            clientNumber = 1;
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
            clientNumber = 2;
            soc.emit("CONNECT_ROOM", roomID.val(), gameboard.width / window.devicePixelRatio, gameboard.height / window.devicePixelRatio, player2Paddle.x, player2Paddle.y, hideForm);
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

        if(canvas.width / devicePixelRatio > otherWidth || canvas.height / devicePixelRatio > otherHeight)
            scaleCanvas(canvas, ctx, otherWidth, otherHeight);

        console.log("Other players canvas " + width + "x" + height);

        soc.emit("SEND_CANVAS", gameboard.width / window.devicePixelRatio, gameboard.height / window.devicePixelRatio, player1Paddle.x, player1Paddle.y);
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
        if(canvas.width / devicePixelRatio > otherWidth || canvas.height / devicePixelRatio > otherHeight)
            scaleCanvas(canvas, ctx, otherWidth, otherHeight);
        console.log("Other players canvas " + width + height);
    });


    soc.on("PLAYER1_SCORE", function(){

        player1Paddle.setScore();
        if(player1Paddle.score == 7){
            alert("Player 1 Won the game!");
            blur.show();
        }
    });

    soc.on("PLAYER2_SCORE", function(){
        player2Paddle.setScore();
        if(player2Paddle.score == 7){
            alert("Player 1 Won the game!");
            blur.show();
        }
    });

    soc.on("CHANGE_PUCK", function(x, vX, y, vY){
        puck.diffX = puck.x - x;
        puck.diffY = puck.y - y;
        puck.diffVX = puck.vX - vX;
        puck.diffVY = puck.vY - vY;

        puck.arriveTime = new Date().getTime() + 45 * .5;



        if(clientNumber == 1){
            puck.x = (puck.x + canvas.width / devicePixelRatio - x) / 2;
            puck.y = (puck.y + canvas.height / devicePixelRatio - y) / 2;

            //console.log(`x: ${x}, y: ${y} `);
            puck.vX = vX;
            puck.vY = vY;
            //console.log(`X: ${puck.x}, Y: ${puck.y}, vX: ${puck.vX}, vY: ${puck.vY}`);
        } else if(clientNumber == 2){
            puck.x = (puck.x + x) / 2;
            puck.y = (puck.y + y) / 2;

            //console.log(`x: ${x}, y: ${y} `);
            puck.vX = -vX;
            puck.vY = -vY;
            //console.log(`X: ${puck.x}, Y: ${puck.y}, vX: ${puck.vX}, vY: ${puck.vY}`);
        }
    });

});
