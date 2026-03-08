require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
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
const { errorHandler } = require('./middlewares/error.middleware');
const http = require('http');
const app = express();

// Create HTTP server
const server = http.createServer(app);

const port = process.env.PORT || 8000;

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// 1. Helmet - Set security HTTP headers
app.use(helmet());

// 2. Rate Limiting - Global (100 requests per 15 minutes per IP)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// 3. Stricter rate limiter for auth routes (10 per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 4. Body parser with size limit (prevent large payload attacks)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. NoSQL Injection Prevention - sanitize request data
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️ NoSQL injection attempt blocked in ${key} from IP: ${req.ip}`);
  }
}));

// 6. HTTP Parameter Pollution protection
app.use(hpp());

// Connect Database
connectDB();

// ============================================
// CORS Configuration
// ============================================
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8081'];

app.get('/', (req, res) => {
  res.send('Welcome to Sapien Score');
});

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

// ============================================
// ROUTES
// ============================================

// Auth routes with stricter rate limiting
app.use('/node/api/auth', authLimiter, authRoutes);
app.use('/node/api/otp', authLimiter, otpRoutes);

// Protected routes
app.use('/node/api/users', userRoutes);
app.use('/node/api/ratings', ratingRoutes);
app.use('/node/api/upload', uploadRoutes);
app.use('/node/api/relations', relationRoutes);
app.use('/node/api/notifications', notificationRoutes);
app.use('/node/api/chatroom', chatroomRoutes);
app.use('/node/api/messages', messageRoutes);
app.use('/node/api/reports', reportRoutes);
app.use('/node/api/terms', termsRoutes);

// ============================================
// ERROR HANDLING
// ============================================
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

// Initialize Socket.io and store on app for use in controllers
const io = initializeSocket(server);
app.set('io', io);

server.listen(PORT, () => console.log(`🚀 Server running securely on port ${PORT}`));
