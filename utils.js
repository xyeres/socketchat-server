const { getUsersInRoom } = require('./users');


function emitRoomData(io, user) {
  io.to(user.room).emit(
    'roomData',
    {
      room: user.room,
      users: getUsersInRoom(user.room)
    }
  );
}

module.exports = { emitRoomData };