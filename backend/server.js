const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const routes = require('./routes');
const { errorHandler } = require('./utils');

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
// Enable CORS for all origins (important for development/frontend)
app.use(cors());

// Body parser to handle JSON data
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// --- Routes ---
// Mount all API routes
app.use('/api', routes);

// --- Serve Frontend Build Folder (Optional but requested) ---
// Assuming a React build folder exists in the root directory named 'client/build'
// if (process.env.NODE_ENV === 'production') {
//     app.use(express.static('client/build'));

//     app.get('*', (req, res) => {
//         res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
//     });
// }


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