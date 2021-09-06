const http = require('http');
const express = require('express');
const socketio = require('socket.io')
const cors = require('cors');

const { addUser, removeUser, getUser } = require('./users');
const { emitRoomData } = require('./utils');

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "https://inspiring-goodall-255229.netlify.app"
  }
});

const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(router);

// A socket client connects...
io.on('connection', (socket) => {
  console.log(`a user connected: ${socket.id}`)

  // 'join' event emits from FROM frontend 
  // with a payload containing name, room...
  socket.on('join', ({ name, room, picIndex }, callback) => {
    // Add user returns either an error or a user
    const { error, user } = addUser({ id: socket.id, name, room, picIndex })
    if (error) return callback(error);

    // Emit TO frontend
    socket.emit('message', { user: 'admin', text: `${user.name} welcome to ${user.room}` })
    // broadcast to this thing or group called 'user.room'
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name}, just slid into the room!` })
    // join this socket client to this thing called 'user.room'
    socket.join(user.room);

    // Emit room data on join
    emitRoomData(io, user);

    callback();
  })

  // when frontend emits 'sendMessage'... respond:
  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', { user: user.name, text: message, picIndex: user.picIndex });
    }

    callback();
  })
  // disconnect handling:
  socket.on('disconnect', () => {
    console.log('a user has disconnected')

    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left.` });
      emitRoomData(io, user);
    }
  })
})

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
