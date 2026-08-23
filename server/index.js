const path = require('path');
const express = require('express');
const tasksRouter = require('./routes/tasks');
const logger = require('./middleware/logger');
const validateContentType = require('./middleware/validateContentType');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');
const mongoose = require('mongoose');

// Load server/.env whether the server is started from root or server/.
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task-manager';

app.use(express.json());
app.use(logger);

// Enable CORS for development / front-end
app.use(cors());

// Mount tasks router with content-type validation for POST/PUT
app.use('/tasks', validateContentType, tasksRouter);

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use(errorHandler);

mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Task Manager API listening on port ${PORT} with MongoDB`));
  })
  .catch((error) => {
    console.warn(`MongoDB unavailable (${error.message}). Starting in temporary in-memory mode.`);
    app.listen(PORT, () => console.log(`Task Manager API listening on port ${PORT} in memory mode`));
  });
