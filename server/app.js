const express = require('express');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/../public'));


server.listen(PORT, function(){
    console.log('Server started on port ' + PORT + '...');
});


io.on('connection', function(socket){
    console.log('Connected to socket ' + socket.id);
    
});