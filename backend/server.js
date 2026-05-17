const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const routes = require('./routes');
const { errorHandler } = require('./utils');
const path = require('path');

// Use the credentials given in the prompt
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/interviewerDB';


const app = express();

// --- MongoDB Connection ---
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully.');
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1); // Exit process with failure
    }
};
connectDB();

// --- Middleware ---
// Enable CORS with configurable origin(s)
const allowedOriginEnv = process.env.CLIENT_ORIGIN || '*';
const allowedOrigins = String(allowedOriginEnv).split(',').map(s => s.trim());
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));

// Body parser to handle JSON data
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// --- Routes ---
// Mount all API routes
app.use('/api', routes);
// Also expose same routes at root so both /auth/* and /api/auth/* work
app.use('/', routes);

// API 404 handler for unmatched /api routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ msg: 'API route not found' });
});

// --- Serve Frontend Build Folder (Optional) ---
// If you deploy backend + frontend together, serve the built frontend here.
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '..', 'frontend', 'dist');
  try {
    app.use(express.static(clientBuildPath));

    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  } catch (e) {
    console.warn('Frontend build not found to serve from backend:', e.message);
  }
}


// --- Global Error Handler ---
app.use(errorHandler);

// --- Start Server ---
const startServer = (listenPort) => {
  const server = app.listen(listenPort, () => {
    console.log(`Server started on port ${listenPort}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${listenPort} is in use. Trying port ${Number(listenPort) + 1}...`);
      startServer(Number(listenPort) + 1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
};

startServer(PORT);