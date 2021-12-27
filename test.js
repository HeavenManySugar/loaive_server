const { App } = require("./uWebSockets.js-20.4.0");
const { Server } = require("socket.io");

const socketapp = new App();
const io = new Server();

io.attachApp(socketapp);

var queue = [];    // list of sockets waiting for peers
var rooms = {};    // map socket.id => room
var names = {};    // map socket.id => name
var allUsers = {}; // map socket.id => socket

var findPeerForLoneSocket = function(socket) {
    // this is place for possibly some extensive logic
    // which can involve preventing two people pairing multiple times
    //console.log(queue)
    if (queue.length) {
        // somebody is in queue, pair them!
        var peer = queue.pop();
        var room = socket.id + '#' + peer.id;
        // join them both
        peer.join(room);
        socket.join(room);
        // register rooms to their names
        rooms[peer.id] = room;
        rooms[socket.id] = room;
        // exchange names between the two of them and start the chat
        peer.emit('chat start', {'name': names[socket.id], 'room':room});
        socket.emit('chat start', {'name': names[peer.id], 'room':room});
    } else {
        // queue is empty, add our lone socket
        queue.push(socket);
    }
}

io.on('connection',function(socket) {

    //The moment one of your client connected to socket.io server it will obtain socket id
    //Let's print this out.
    console.log(`Connection : SocketId = ${socket.id}`)
    //Since we are going to use userName through whole socket connection, Let's make it global.   
    //var userName = '';
    
    socket.on('subscribe', function(data) {
        console.log('subscribe trigged')
        const room_data = JSON.parse(data)
        userName = room_data.userName;
        console.log(`[userName] ${userName} : Join`)
        names[socket.id] = room_data.userName;
        allUsers[socket.id] = socket;
        // now check if sb is in queue
        findPeerForLoneSocket(socket);
    })

    socket.on('unsubscribe',function(data) {
        console.log('unsubscribe trigged')
        const room_data = JSON.parse(data)
        const userName = room_data.userName;
        const roomName = rooms[socket.id];
        var index = queue.indexOf(socket)
        queue = queue.slice(0,index).concat(queue.slice(index+1))
        console.log(`Username : ${userName} leaved Room Name : ${roomName}`)
        socket.broadcast.to(`${roomName}`).emit('userLeftChatRoom',userName)
        socket.leave(`${roomName}`)
    })

    socket.on('newMessage',function(data) {
        //console.log('newMessage triggered')

        const messageData = JSON.parse(data)
        const messageContent = messageData.messageContent
        //const roomName = messageData.roomName
        var roomName = rooms[socket.id];
        var userName = names[socket.id];

        console.log(`[Room Number ${roomName}] ${userName} : ${messageContent}`)
        // Just pass the data that has been passed from the writer socket

        const chatData = {
            userName : userName,
            messageContent : messageContent,
            roomName : roomName
        }
        socket.broadcast.to(`${roomName}`).emit('updateChat',JSON.stringify(chatData)) // Need to be parsed into Kotlin object in Kotlin
    })

    // socket.on('typing',function(roomNumber){ //Only roomNumber is needed here
    //     console.log('typing triggered')
    //     socket.broadcast.to(`${roomNumber}`).emit('typing')
    // })

    // socket.on('stopTyping',function(roomNumber){ //Only roomNumber is needed here
    //     console.log('stopTyping triggered')
    //     socket.broadcast.to(`${roomNumber}`).emit('stopTyping')
    // })    

    socket.on('disconnect', function () {
        console.log("One of sockets disconnected from our server.")
    });
})


socketapp.listen(3001, (token) => {
  if (!token) {
    console.warn("port already in use");
  }
});