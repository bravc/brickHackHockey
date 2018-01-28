const express = require('express');
const uuid = require('uuid/v4');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/../public'));


server.listen(PORT, function(){
    console.log('Server started on port ' + PORT + '...');
});

let openRooms = {};
let roomID = 0;

io.on('connection', function(socket){
    //When you connect to the site, tell the server
    console.log('Connected to socket ' + socket.id);

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
    socket.on('CONNECT_ROOM', function(roomID, width, height, callback){
        if (roomID in openRooms) {
            if(openRooms[roomID] < 2){
                openRooms[roomID] = 2;
                socket.join(roomID);
                console.log("Joining room: " + roomID);
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
    socket.on("SEND_CANVAS", function(width, height){
        socket.broadcast.to(roomID).emit("PLAYER1_CANVAS", width, height);
    });

    /**
     * Move paddle on opponent screen
     */
    socket.on("MOVE_PADDLE", function(x ,y){
        socket.broadcast.to(roomID).emit("OPPONENT_PADDLE_MOVE", x,y);
    });

});
