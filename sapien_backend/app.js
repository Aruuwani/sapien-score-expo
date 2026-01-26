require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const otpRoutes = require('./routes/otpRoutes');
const ratingRoutes = require('./routes/rating.routes');
const uploadRoutes = require('./routes/upload.routes')
const relationRoutes = require('./routes/relationRoute')
const notificationRoutes = require('./routes/notification');
const chatroomRoutes = require('./routes/chatroom.routes');
const messageRoutes = require('./routes/messageRoutes');
const reportRoutes = require('./routes/reportRoomRoute');
const termsRoutes = require('./routes/termsConditions.routes');
const { initializeSocket } = require('./socket');
const http = require('http');
const app = express();

// Create HTTP server
const server = http.createServer(app);

const port = process.env.PORT || 8000;
// Middleware
app.use(express.json());

// Connect Database
connectDB();

// CORS
app.get('/', (req, res) => {
  res.send('Welcome to Sapien Score');
});
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

// Routes

app.use('/node/api/auth', authRoutes);  // New authentication routes
app.use('/node/api/users', userRoutes);
app.use('/node/api/otp', otpRoutes);  // Deprecated - kept for backward compatibility
app.use('/node/api/ratings', ratingRoutes);
app.use('/node/api/upload', uploadRoutes);
app.use('/node/api/relations', relationRoutes);
app.use('/node/api/notifications', notificationRoutes);
app.use('/node/api/chatroom', chatroomRoutes);
app.use('/node/api/messages', messageRoutes);
app.use('/node/api/reports', reportRoutes);
app.use('/node/api/terms', termsRoutes);

// Start Server
const PORT = process.env.PORT || 5000;

// Initialize Socket.io and store on app for use in controllers
const io = initializeSocket(server);
app.set('io', io);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
