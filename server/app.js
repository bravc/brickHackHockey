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

io.on('connection', function(socket){
    console.log('Connected to socket ' + socket.id);
    connectedUsers[uuid()] = socket.id;

    let roomID = uuid();

    socket.on('ROOM_CONNECT', function(uuid){
        if (connectedUsers.includes(uuid)){
            socket.join(roomID);
            socket.to(connectedUsers[uuid]).emit("ROOM_REQUEST", roomID );
        }
    });

    socket.on("ROOM_ACCEPT", function(roomID){
        socket.join(roomID);
    });
    
});