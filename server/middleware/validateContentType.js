module.exports = function (req, res, next) {
  if ((req.method === 'POST' || req.method === 'PUT') && (!req.is('application/json'))) {
    return res.status(400).json({ error: 'Content-Type application/json required' });
  }
  next();
};
