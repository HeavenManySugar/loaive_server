var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var socketio = require('socket.io');

//var indexRouter = require('./routes/index');
var memberRouter = require('./routes/member');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', indexRouter);
app.use('/member', memberRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


//Chat Server

const { App } = require("./uWebSockets.js-20.4.0");
const { Server } = require("socket.io");
const verify = require('./models/verification_model');
const memberData = require('./models/data_model');
const Check = require('./service/member_check');
const check = new Check

const socketapp = new App();
const io = new Server();

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
        //peer.emit('chat start', {'name': names[socket.id], 'room':room});
        //socket.emit('chat start', {'name': names[peer.id], 'room':room});
        peer.emit('newUserToChatRoom',names[socket.id])
        socket.emit('newUserToChatRoom',names[peer.id])
    } else {
        // queue is empty, add our lone socket
        queue.push(socket);
    }
}

io.attachApp(socketapp);

io.on('connection',function(socket) {

    //The moment one of your client connected to socket.io server it will obtain socket id
    //Let's print this out.
    console.log(`Connection : SocketId = ${socket.id}`)
    //Since we are going to use userName through whole socket connection, Let's make it global.   
    var userName = '';
    
    socket.on('subscribe', function(data) {
        console.log('subscribe trigged')
        const room_data = JSON.parse(data)
        const token = room_data.token;
        //console.log(room_data)
        //console.log(token)
        if (check.checkNull(token) === false) {
          verify(token).then(tokenResult => {
              if (tokenResult === false) {
                socket.emit("subscribe fail")
              } else {
                  const id = tokenResult;
                  memberData(id).then(result => {
                    userName = result[0].name
                    console.log(`[userName] ${userName} : Join`)
                    names[socket.id] = userName;
                    allUsers[socket.id] = socket;
                    // now check if sb is in queue
                    findPeerForLoneSocket(socket);
                  }, (err) => {
                    socket.emit("subscribe fail")
                  })
                  
              }
          })
        }
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


module.exports = app;
