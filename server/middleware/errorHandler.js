module.exports = function (err, req, res, next) {
  console.error('Global error handler:', err && err.stack ? err.stack : err);
  if (res.headersSent) return next(err);

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.keys(err.errors).map(k => err.errors[k].message);
    return res.status(400).json({ error: 'Validation error', details: errors });
  }

  // CastError when invalid ObjectId provided
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  res.status(500).json({ error: 'Internal Server Error' });
};
