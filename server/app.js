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
let openRooms = [];

io.on('connection', function(socket){
    console.log('Connected to socket ' + socket.id);
    connectedUsers[uuid()] = socket.id;

    socket.on('ADD_ROOM', function(){
        let roomID = uuid();
        openRooms.push(roomID);
        socket.join(roomID);
        console.log(roomID);
    });

    socket.on('CONNECT_ROOM', function(roomID){
        if (openRooms.includes(roomID)) {
            socket.join(roomID);
            console.log("Joining room: " + roomID);
        } else {
            console.log(roomID + " is an invalid roomID");
        }
    });

});
