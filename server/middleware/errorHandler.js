module.exports = function (err, req, res, next) {
  console.error('Global error handler:', err && err.stack ? err.stack : err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal Server Error' });
};
