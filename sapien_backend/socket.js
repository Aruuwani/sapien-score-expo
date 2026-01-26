const socketio = require('socket.io');

let io;

exports.initializeSocket = (server) => {
  io = socketio(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`Client ${socket.id} joined room ${roomId}`);
    });

    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId);
      console.log(`Client ${socket.id} left room ${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

exports.getIo = () => io;