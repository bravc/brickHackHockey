const express = require('express');
const uuid = require('uuid/v4');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    transports: ["websocket", "polling"],
    serveClient: false
});
const PORT = process.env.PORT || 3000;

const updateTime = 45;
const minVelocity = 300;
const wallReturn = 3;
const accelerationConstant = 10000;
const velocityMultiple = 500;

app.use(express.static(__dirname + '/../public'));


server.listen(PORT, function(){
    console.log('Server started on port ' + PORT + '...');
});

let openRooms = {};
let roomID = 0;

let canvas1,
    canvas2;

class Paddle{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.previousX = x;
        this.previousY = y;
        this.isColiding = false
        this.radius = 40;
        this.score = 0;
    }
    setScore(){
        this.score += 1;
    }
}

//represents the puck
class Puck {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vX = 0;
        this.vY = 0;
        this.xIsColiding = false;
        this.yIsColiding = false;
        this.deceleration = 0.000;
        this.radius = 15;
        this.mass = 0.2;
    }
    setPosition(x,y){
        let canvas1Width = canvas1[0];
        let canvas1Height = canvas1[1];

        let canvas2Width = canvas2[0];
        let canvas2Height = canvas2[1];

        let canvasWidthRatio = canvas1Width / canvas1Width;
        let canvasHeightRatio = canvas1Height / canvas1Height;

        let client1X = client1.x;
        let client1Y = client1.y;

        let client2X = client2.x;
        let client2Y = client2.y;


        //console.log(`canvas1Width: ${canvas1Width}, canvas1Height: ${canvas1Height}, canvas2Width: ${canvas2Width}, canvas2Height: ${canvas2Height}, client1X: ${client1X}, client1Y: ${client1Y}, client2X: ${client2X}, client2Y: ${client2Y}`);

        if(this.x + this.radius >= canvas1Width && this.xIsColiding == false){
            this.vX = -this.vX;
            x -= wallReturn;
            this.xIsColiding = true;
        } else if(this.x - this.radius <= 0 && this.xIsColiding == false){
            this.vX = -this.vX;
            x += wallReturn;
            this.xIsColiding = true;
        } else {
            this.xIsColiding = false;
        }

        if(this.y >= canvas1Height && this.yIsColiding == false){
            this.vY = -this.vY;
            y -= wallReturn;

            //Goal scored and puck replaced at center ice
            if(this.x > ((canvas1Width / 4) + 5)
                && this.x < ((canvas1Width * 3 / 4) - 5)){
                    console.log("Player 2 Goal!");

                    io.in(roomID).emit("PLAYER2_SCORE");
                    this.vY = 0;
                    this.vX = 0;
                    y = canvas1Height / 2;
                    x = canvas1Width / 2;
            } else {
                this.vY = -this.vY;
                y -= wallReturn;
                this.yIsColiding = true;
            }
        } else if(this.y <= 0 && this.yIsColiding == false){

            //Goal scored and puck replaced at center ice
            if(this.x > ((canvas1Width / 4) + 5)
                && this.x < ((canvas1Width * 3 / 4) - 5)){
                    console.log("Player 1 Goal!");

                    io.in(roomID).emit("PLAYER1_SCORE");
                    this.vY = 0;
                    this.vX = 0;
                    y = canvas1Height / 2;
                    x = canvas1Width / 2;
            } else {
                this.vY = -this.vY;
                y += wallReturn;
                this.yIsColiding = true;
            }

        } else {
            this.yIsColiding = false;
        }
        this.x = x;
        this.y = y;

        //puck collision detection with paddle 1
        let player1Dx = puck.x - client1X;
        let player1Dy = puck.y - client1Y;
        let player1Radii = puck.radius + client1.radius;
        if ( ( player1Dx * player1Dx )  + ( player1Dy * player1Dy ) < player1Radii * player1Radii){
            if(!client1.isColiding){
                let vX = (client1X - client1.previousX) / (updateTime * velocityMultiple);
                let vY = (client1Y - client1.previousY) / (updateTime * velocityMultiple);
                puck.vX = -vX * accelerationConstant;
                puck.vY = -vY * accelerationConstant;
            }
            //console.log(`puckX: ${x}, puckY: ${y}, player1Dx: ${player1Dx}, player1Dy: ${player1Dy}`);
            client1.isColiding = true;
            //console.log("CLIENT 1 COLIDING");
        } else {
            client1.isColiding = false;
        }

        //puck collision detection
        let player2Dx = puck.x - client2X;
        let player2Dy = puck.y - client2Y;
        let player2Radii = puck.radius + client2.radius;
        if ( ( player2Dx * player2Dx )  + ( player2Dy * player2Dy ) < player2Radii * player2Radii ){
            if(!client2.isColiding){
                let vX = (client2X - client2.previousX * canvasWidthRatio) / (updateTime * velocityMultiple);
                let vY = (client2Y - client2.previousY * canvasHeightRatio) / (updateTime * velocityMultiple);
                puck.vX = vX * accelerationConstant;
                puck.vY = vY * accelerationConstant;
            }
            //console.log(`puckX: ${x}, puckY: ${y}, player2Dx: ${player2Dx}, player2Dy: ${player2Dy}`);
            client2.isColiding = true;
            //console.log("CLIENT 2 COLIDING");
            debugger;
        } else {
            client2.isColiding = false;
        }
    }
    updatePosition(){

        this.setPosition(this.x + this.vX, this.y + this.vY);

        //this acceleration calculations
        if(this.vX > 0){
            if(this.vX - this.deceleration > minVelocity){
                this.vX -= this.deceleration;
            }
        }
        else if(this.vX < 0){
            if(this.vX + this.deceleration > -minVelocity){
              this.vX += this.deceleration;
            }
        }

        if(this.vY > 0){
            if(this.vY - this.deceleration > minVelocity){
                this.vY -= this.deceleration;
            }
        } else if(this.vY < 0){
            if(this.vY + this.deceleration > -minVelocity){
                this.vY += this.deceleration;
            }
        }
    }
}

let client1;
let client2;
let puck;
let soc;


io.on('connection', function(socket){
    //When you connect to the site, tell the server
    console.log('Connected to socket ' + socket.id);
    soc = socket;

    let timer = setInterval(checkPuckCollision, updateTime);

    /**
     * Create a new room with a size of one
     * and callback to the client with the new roomID
     */
    socket.on('ADD_ROOM', function(roomName, callback){
        roomID = roomName;
        openRooms[roomID] = 1;
        socket.join(roomID);
        console.log(roomID);
        callback(roomID);
    });

    /**
     * Attempt to connect to the room, if it's full
     * alert the client. Otherwise, join the room
     * and enter the game
     */
    socket.on('CONNECT_ROOM', function(roomID, width, height, paddle2X, paddle2Y, callback){
        if (roomID in openRooms) {
            if(openRooms[roomID] < 2){
                openRooms[roomID] = 2;
                socket.join(roomID);
                console.log("Joining room: " + roomID);
                canvas2 = [width, height];
                client2 = new Paddle(paddle2X, paddle2Y);
                socket.to(roomID).emit("ENTER_GAME", width, height);
                callback('');
            }else{
                callback('Room is full!');
            }
        } else {
            console.log(roomID + " is an invalid roomID");
            callback('Room does not exist!');
        }
    });

    /**
     * Exit the room
     * alert the other member of the room
     */
    socket.on('disconnect', function(){
        if (roomID !== 0) {
            socket.to(roomID).emit('EXIT_ROOM');
            socket.leave(roomID);
            delete openRooms[roomID];
        }
    });

    /**
     * Send canvas to other player
     */
    socket.on("SEND_CANVAS", function(width, height, paddleX, paddleY){
        canvas1 = [width, height];
        puck = new Puck(width / 2, height / 2);
        console.log("" + width / 2 + "," + height /2);
        client1 = new Paddle(paddleX,paddleY);
        socket.broadcast.to(roomID).emit("PLAYER1_CANVAS", width, height);
    });

    /**
     * Move paddle on opponent screen
     */
    socket.on("MOVE_PADDLE", function(x ,y, clientNumber){
        if(clientNumber == 1 && client1){
            client1.previousX = client1.x;
            client1.previousY = client1.y;
            client1.x = x;
            client1.y = y;
        } else if(client2) {
            client2.previousX = client2.x;
            client2.previousY = client2.y;
            client2.x = x;
            client2.y = y;
        }
        socket.broadcast.to(roomID).emit("OPPONENT_PADDLE_MOVE", x,y);
    });

    // socket.on("PLAYER1_GOAL", function(){
    //     socket.to(roomID).emit("PLAYER1_SCORE");
    // });

    // socket.on("PLAYER2_GOAL", function(){
    //     socket.to(roomID).emit("PLAYER2_SCORE");
    // });

    // socket.on("PUCK_CHANGE", function(x, vX, y, vY){
    //     socket.to(roomID).emit("CHANGE_PUCK", x, vX, y, vY);
    // });

    function checkPuckCollision(){
        if(client1 && client2 && puck){
            puck.updatePosition();

            let canvas1Width = canvas1[0];
            let canvas1Height = canvas1[1];

            let canvas2Width = canvas2[0];
            let canvas2Height = canvas2[1];

            let canvasWidthRatio = canvas1Width / canvas2Width;
            let canvasHeightRatio = canvas1Height / canvas2Height;

            socket.to(roomID).emit("CHANGE_PUCK", puck.x, puck.vX, puck.y, puck.vY);

        }
    }

});
