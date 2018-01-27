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


let connectedUsers = {};
let openRooms = {};

io.on('connection', function(socket){
    //When you connect to the site, tell the server
    console.log('Connected to socket ' + socket.id);
    connectedUsers[uuid()] = socket.id;

    /**
     * Create a new room with a size of one
     * and callback to the client with the new roomID
     */
    socket.on('ADD_ROOM', function(callback){
        let roomID = uuid();
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
    socket.on('CONNECT_ROOM', function(roomID, callback){
        if (roomID in openRooms) {
            if(openRooms[roomID] < 2){
                openRooms[roomID] = 2;
                socket.join(roomID);
                console.log("Joining room: " + roomID);
                socket.to(roomID).emit("ENTER_GAME");
                callback('');
            }else{
                callback('Room is full!');
            }
        } else {
            console.log(roomID + " is an invalid roomID");
            callback('Room does not exist!');
        }
    });

});
