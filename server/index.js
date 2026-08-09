const express = require('express');
const tasksRouter = require('./routes/tasks');
const logger = require('./middleware/logger');
const validateContentType = require('./middleware/validateContentType');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

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

app.listen(PORT, () => {
  console.log(`Task Manager API listening on port ${PORT}`);
});
