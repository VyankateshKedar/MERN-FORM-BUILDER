// backend/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const folderRoutes = require('./routes/folderRoutes');
const formRoutes = require('./routes/formRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const userRoutes = require('./routes/userRoutes');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
(async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB successfully');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1); // Exit the application if the database connection fails
  }
})();

// Basic health check route
app.get('/', (req, res) => {
  res.status(200).send('Form Builder API is running...');
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/users', userRoutes);

// Catch-all route for unmatched endpoints
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'An unexpected error occurred!' });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  server.close(() => {
    process.exit(1); // Exit after closing the server
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server shut down successfully.');
    process.exit(0);
  });
});
