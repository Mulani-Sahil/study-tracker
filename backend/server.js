require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const statsRoutes = require('./routes/stats');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://your-frontend-domain.onrender.com"  // 👈 put your real frontend URL here
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Study Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Study Tracker API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth (register, login, me)',
      tasks: '/api/tasks (CRUD operations)',
      stats: '/api/stats (today, week, streak, subjects)'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   📚 Study Tracker API Server         ║
║                                        ║
║   🚀 Running on port ${PORT}            ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}      ║
║   📡 CORS enabled for: ${process.env.FRONTEND_URL || 'localhost:3000'}
║                                        ║
║   Endpoints:                           ║
║   • POST /api/auth/register            ║
║   • POST /api/auth/login               ║
║   • GET  /api/auth/me                  ║
║   • GET  /api/tasks                    ║
║   • POST /api/tasks                    ║
║   • GET  /api/stats/today              ║
║   • GET  /api/stats/week               ║
║   • GET  /api/stats/streak             ║
╚════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});
